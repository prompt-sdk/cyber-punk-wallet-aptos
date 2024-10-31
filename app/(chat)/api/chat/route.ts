import { convertToCoreMessages, Message, streamText, generateId } from 'ai';
import { z, ZodObject } from 'zod';
import { getAptosClient } from '@/components/utils/utils';
import { customModel } from '@/ai';
import { auth } from '@/app/(auth)/auth';
import { deleteChatById, getChatById, saveChat } from '@/db/queries';
import { Agent } from '@/db/schema';
import { widgetWithArgs } from '@/ai/widget-tool';

import { Model, models } from '@/lib/model';
import {
  convertParamsToZod,
  extractParameters,
  jsonSchemaToZodSchema,
  getUrl,
} from '@/components/utils/utils';

type ParametersData = Record<string, any>; // Define the shape of ParametersData based on your requirements

// Schema for the `tool` object entries
interface ToolEntry {
  description: string;
  parameters: ZodObject<any>; // This can be refined to match `ParametersSchema` type
  execute: (ParametersData: ParametersData) => Promise<string>;
}
type ToolKey = `${string}_${string}_${string}`;
type Tool = Record<ToolKey, ToolEntry>;

export async function POST(request: Request) {
  const {
    id,
    messages,
    model,
    agent,
    tools,
  }: {
    id: string;
    messages: Array<Message>;
    model: Model['name'];
    agent: Agent;
    tools: Tool[];
  } = await request.json();
  const aptosClient = getAptosClient();

  const session = await auth();

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!models.find((m) => m.name === model)) {
    return new Response('Model not found', { status: 404 });
  }
  console.log("tools",tools);

  const toolData = tools.reduce((tool: any, item: any) => {
    if (item.typeName == 'contractTool') {
      const filteredObj: any = convertParamsToZod(item.params);
      const ParametersSchema: any = Object.fromEntries(
        Object.entries(filteredObj).filter(
          ([key, value]) => value !== undefined
        )
      );
      // tool[item.typeName + '_' + generateId()] = {
      //   description: 'Get aptos address',
      //   parameters: z.object({}),
      //   execute: async () => {
      //     return 'aptos address : 0x1::aptos_coin::AptosCoin';
      //   },
      // };
      tool[
        item.typeName +
          '_' +
          item.typeFunction +
          '_' +
          item.name.replaceAll('::', 'o0')
      ] = {
        description: item.description,
        parameters: z.object(ParametersSchema),
        execute: async (ParametersData: ParametersData) => {
          const filteredObj = Object.entries(ParametersData)
            .filter(([key, value]) => key !== 'CoinType')
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

          const filteredObjCointype = Object.keys(ParametersData)
            .filter((key) => key === 'CoinType')
            .reduce((acc, key) => ({ ...acc, [key]: ParametersData[key] }), {});

          const data: any = {
            functionArguments: Object.values(filteredObj).map((item: any) =>
              typeof item === 'number' ? BigInt(item * 10 ** 18) : item
            ),
            function: item.name,
            typeArguments: Object.values(filteredObjCointype),
          };
          if (item.typeFunction == 'entry') {
            return `data: ${JSON.stringify(data)}`;
          }
          if (item.typeFunction == 'view') {
            try {
              const res = await aptosClient.view({ payload: data });
              return `data: ${JSON.stringify(res)} `;
            } catch (error) {
              console.log(error);
              return `data: ${JSON.stringify(error)} `;
            }

            // should use text generation
          }
          return 'dont know';
        },
      };
      //if view return data
    }
    if (item.typeName == 'widgetTool') {
      const filteredObj: any = item.params
        ? convertParamsToZod(item.params)
        : {};
      const ParametersSchema: any = Object.fromEntries(
        Object.entries(filteredObj).filter(
          ([key, value]) => value !== undefined
        )
      );
      
      tool[item.typeName + '_' + item.typeFunction + '_' + generateId()] = {
        description: item.description,
        parameters: z.object(ParametersSchema),
        execute: async (ParametersSchema: ParametersData) => {
          const prompt = `${item.prompts} ${JSON.stringify(ParametersSchema)}`;
          const code = await widgetWithArgs({ prompt });
          return code;
        },
      };
    }
    if (item.typeName == 'apiTool') {
      const spec = item.spec;
      const baseUrl = spec.servers[0].url;
      for (const path in spec.paths) {
        // example of path: "/engines"
        const methods = spec.paths[path];
        for (const method in methods) {
          // example of method: "get"
          const spec = methods[method];
          const toolName = spec.operationId;
          const toolDesc = spec.description || spec.summary || toolName;

          let zodObj: any = {};
          if (spec.parameters) {
            // Get parameters with in = path
            let paramZodObjPath: any = {};
            for (const param of spec.parameters.filter(
              (param: any) => param.in === 'path'
            )) {
              paramZodObjPath = extractParameters(param, paramZodObjPath);
            }

            // Get parameters with in = query
            let paramZodObjQuery: any = {};
            for (const param of spec.parameters.filter(
              (param: any) => param.in === 'query'
            )) {
              paramZodObjQuery = extractParameters(param, paramZodObjQuery);
            }

            // Combine path and query parameters
            zodObj = {
              ...zodObj,
              PathParameters: z.object(paramZodObjPath),
              QueryParameters: z.object(paramZodObjQuery),
            };
          }

          if (spec.requestBody) {
            let content: any = {};
            if (spec.requestBody.content['application/json']) {
              content = spec.requestBody.content['application/json'];
            } else if (
              spec.requestBody.content['application/x-www-form-urlencoded']
            ) {
              content =
                spec.requestBody.content['application/x-www-form-urlencoded'];
            } else if (spec.requestBody.content['multipart/form-data']) {
              content = spec.requestBody.content['multipart/form-data'];
            } else if (spec.requestBody.content['text/plain']) {
              content = spec.requestBody.content['text/plain'];
            }
            const requestBodySchema = content.schema;
            if (requestBodySchema) {
              const requiredList = requestBodySchema.required || [];
              const requestBodyZodObj = jsonSchemaToZodSchema(
                requestBodySchema,
                requiredList,
                'properties'
              );
              zodObj = {
                ...zodObj,
                RequestBody: requestBodyZodObj,
              };
            } else {
              zodObj = {
                ...zodObj,
                input: z.string().describe('Query input').optional(),
              };
            }
          }

          if (!spec.parameters && !spec.requestBody) {
            zodObj = {
              input: z.string().describe('Query input').optional(),
            };
          }

          tool[item.typeName + '_' + toolName + '_' + generateId()] = {
            description: toolDesc,
            parameters: z.object(zodObj),
            execute: async (arg: any) => {
              const headers: any = {
                Accept: 'application/json',
              };

              if (item.accessToken) {
                headers.Authorization = `Bearer ${item.accessToken}`;
              }
              const callOptions: RequestInit = {
                method: method,
                headers: {
                  'Content-Type': 'application/json',
                  ...headers,
                },
              };
              if (arg.RequestBody && method.toUpperCase() !== 'GET') {
                callOptions.body = JSON.stringify(arg.RequestBody);
              }
              const completeUrl = getUrl(`${baseUrl}${path}`, arg);
              console.log(completeUrl);

              try {
                const response = await fetch(completeUrl, callOptions);
                const data = await response.json();
                return data;
              } catch (error) {
                console.error('Failed to make API request:', error);
                return `Failed to make API request: ${error}`;
              }
            },
          };
        }
      }
    }
    return tool;
  }, {});
  const coreMessages = convertToCoreMessages(messages);
  const result = await streamText({
    model: customModel(model),
    system: `Your name is ${agent.name} \n\n
       Your desciption is ${agent.description} \n\n
      ${agent.prompt}`,
    messages: coreMessages,
    maxSteps: 5,
    tools: toolData as any,
    onFinish: async ({ responseMessages }) => {
      if (session.user && session.user.id) {
        try {
          await saveChat({
            id,
            messages: [...coreMessages, ...responseMessages],
            userId: session.user.id,
            agentId: agent.id,
          });
        } catch (error) {
          console.error('Failed to save chat');
        }
      }
    },
    experimental_telemetry: {
      isEnabled: true,
      functionId: 'stream-text',
    },
  });

  return result.toDataStreamResponse({});
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}
