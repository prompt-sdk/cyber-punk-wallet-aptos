import 'server-only'

import {
  createAI,
  getMutableAIState,
  getAIState,
  streamUI,
  createStreamableValue,

} from 'ai/rsc'
import { streamMulti } from "ai-stream-multi";

import { openai } from '@ai-sdk/openai'
import { getTools, getAgentById } from '../db/store-mongodb';
import { BotCard, BotMessage } from '@/modules/chat/components/chat-card';
import { any, z } from 'zod'
import { SmartActionSkeleton } from '@/modules/chat/components/smartaction/action-skeleton'
import {
  sleep,
  nanoid
} from '@/modules/chat/utils/utils'
import { ViewFrame } from '@/modules/chat/validation/ViewFarm';

import { generateText, generateId, CoreMessage } from 'ai';
import { saveChat } from '@/libs/chat/chat.actions'
import { SpinnerMessage, UserMessage } from '@/modules/chat/components/chat-card';
import { Chat, Message } from 'types/chat'
import { auth } from '@/modules/auth/constants/auth.config';
import { SmartAction, SmartView } from '@/modules/chat/components/smartaction/action'
import { getAptosClient } from '@/modules/chat/utils/aptos-client';
import { makeToolApiRequest } from '../tools/apiTool';

const aptosClient = getAptosClient();

async function submitUserMessage(content: string) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'user',
        content
      }
    ]
  })
  let textStream: undefined | ReturnType<typeof createStreamableValue<string>>
  let textNode: undefined | React.ReactNode


  const agent: any = await getAgentById(aiState.get().agentId)
  const tool_ids = [...agent.tool_ids, ...agent.widget_ids]

  const dataTools = await getTools(tool_ids);

  const zodExtract = (type: any, describe: any) => {

    if (type == 'u128') return z.number().describe(describe)
    if (type == 'u64') return z.number().describe(describe)
    if (type == 'u8') return z.number().describe(describe)
    if (type == 'bool') return z.boolean().describe(describe)
    if (type == 'address') return z.string().describe(describe)
    if (type == 'vector<u8>') return z.string().describe(describe)
    if (type == 'vector<address>') return z.array(z.string()).describe(describe)
    if (type == 'vector<string::String>') return z.array(z.string()).describe(describe)
    if (type == '0x1::string::String') return z.array(z.string()).describe(describe)
    if (type == 'generic') return z.string().describe(" address type like 0x1::ABC::XYZ")
    if (type == 'Type') return z.string().describe(" address type like 0x1::ABC::XYZ")
    if (type == 'TypeInfo') return z.string().describe(" address type like 0x1::ABC::XYZ")
    return z.string().describe(describe)
  }

  const tools = dataTools.reduce((tool: any, item: any) => {

    if (item.type == 'apiTool') {
      const itemTool = JSON.parse(item.tool.data)

      const apiHost = itemTool.servers[0].url
      for (const path in itemTool.paths) {
        const endpoint = apiHost + path

        for (const method in itemTool.paths[path]) {
          // get the parameters for this method
          const methodSchema = itemTool.paths[path][method]
          const description = methodSchema.summary

          const convertSchemaToParams: any = (param: any) => {
            console.log('converting schema to params', param)
            if (!param.type) { // if there is no type, it means thereis more than one parameter in params.
              const objectWithMultipleParams: any = {}
              for (const key in param) {
                objectWithMultipleParams[key] = convertSchemaToParams(param[key])
              }
              return objectWithMultipleParams
            }

            switch (param.type) {
              case 'string':
                return z.string().describe(param.description)
              case 'integer':
                return z.number().describe(param.description)
              case 'boolean':
                return z.boolean().describe(param.description)
              case 'array':
                return z.array(convertSchemaToParams(param.items))
              case 'object':
                return z.object(convertSchemaToParams(param.properties))
              default:
                console.log("unsupported type", param.type)
                return z.string().describe('unknown description')
            }
          }
          let parameters //TODO: add some typecript types here
          let typeRequest: any = ""
          if (methodSchema.requestBody) {
            let schemaRef: any = "";
            if (methodSchema.requestBody?.content) {
              if (methodSchema.requestBody?.content['application/json']) {
                typeRequest = 'application/json'
                schemaRef = methodSchema.requestBody?.content['application/json'].schema['$ref']
                const schema = schemaRef.split('/').pop()

                parameters = itemTool.components.schemas[schema]

                parameters = convertSchemaToParams(parameters)
              }
              if (methodSchema.requestBody?.content['application/octet-stream']) {
                parameters = methodSchema.requestBody?.content['application/octet-stream'].schema
                typeRequest = 'application/octet-stream'
                parameters = convertSchemaToParams(parameters)
              }
              if (methodSchema.requestBody?.content['application/x-www-form-urlencoded']) {
                typeRequest = 'application/x-www-form-urlencoded'
                parameters = methodSchema.requestBody?.content['application/x-www-form-urlencoded'].schema
                parameters = convertSchemaToParams(parameters)
              }
            }


            if (methodSchema.requestBody?.$ref) {
              schemaRef = methodSchema.requestBody?.$ref
              parameters = {}
            }
          } else {
            parameters = methodSchema.parameters
            if (parameters) {
              parameters = z.object(parameters.reduce((acc: any, param: any) => {
                switch (param.schema.type) {
                  case 'string':
                    return acc[param.name] = z.string().describe(param.description)
                  default: // this may work for other types, but it is untested. 
                    console.log('unsupported type', param.schema.type)
                    if (param.schema) {
                      return acc[param.name] = convertSchemaToParams(param.schema)
                    } else {
                      return acc[param.name] = convertSchemaToParams(param)
                    }

                }
              }, {}))
            }
            else {
              parameters = z.object({})
            }
            if (method == 'parameters') {
              // convert array to object parameters : {type:} then convert 
              parameters = methodSchema.reduce((acc: any, item: any) => {
                acc[item.name] = item.schema.type == 'string' ? z.string() : z.number();
                return acc;
              }, {});
              parameters = z.object(parameters)

            }

          }

          tool[item.type + '_' + generateId()] = {
            description: "get token address of APT",
            parameters,
            generate: async function* (payloadGeneratedByModel: any) {

              yield (
                <BotCard name={agent.name}>
                  <SmartActionSkeleton />
                </BotCard>
              )
              sleep(1000)
              const accessToken = item.tool.accessToken
              const response = await makeToolApiRequest(accessToken, endpoint, payloadGeneratedByModel, method, typeRequest)

              return <BotCard name={agent?.name}><SmartView props={JSON.stringify(response)} /></BotCard>
            }
          }
        }



      }

    }
    if (item.type == 'contractTool') {
      const filteredObj = Object.keys(item.tool.params).reduce((acc: any, key: any) => {
        acc[key] = key = zodExtract(item.tool.params[key].type, item.tool.params[key].description);
        return acc;
      }, {})
      const ParametersSchema: any = Object.fromEntries(
        Object.entries(filteredObj).filter(([key, value]) => value !== undefined)
      );
      type ParametersData = z.infer<typeof ParametersSchema>;
      tool[item.type + '_' + generateId()] = {
        description: item.tool.description,
        parameters: z.object(ParametersSchema),
        generate: async function* (ParametersData: ParametersData) {
          if (item.tool.type == 'entry') {

            yield (
              <BotCard name={agent.name}>
                <SmartActionSkeleton />
              </BotCard>
            )

            await sleep(1000)
            const data = {
              functionArguments: Object.values(ParametersData).map((item: any) =>
                typeof item === 'number' ? BigInt(item * 10 ** 18) : item
              ),
              function: item.name,
              typeArguments: item.tool.generic_type_params
            }

            return <BotCard name={agent.name}>
              <SmartAction props={data} />
            </BotCard>

          }
          if (item.tool.type == 'view') {
            yield (
              <BotCard name={agent.name}>
                <SmartActionSkeleton />
              </BotCard>
            )
            const filteredObj = Object.entries(ParametersData)
              .filter(([key, value]) => key !== "CoinType")
              .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});


            const filteredObjCointype = Object.keys(ParametersData)
              .filter(key => key === "CoinType")
              .reduce((acc, key) => ({ ...acc, [key]: ParametersData[key] }), {});

            const data: any = {
              functionArguments: Object.values(filteredObj).map((item: any) =>
                typeof item === 'number' ? BigInt(item * 10 ** 18) : item
              ),
              function: item.name,
              typeArguments: Object.values(filteredObjCointype)
            }
            try {
              const res = await aptosClient.view({ payload: data });

              item.tool.return = res;

              const { text } = await generateText({
                model: openai('gpt-4o'),
                system: `
        When User ask like this :" what is balance of address 0xd610d0aa100010f0819ea3b1071eda0524b60fb625580fa2d1398f2aad76f04c " and you have data below:    
            {
        _id: {id_tool},
  "name": "{data_name}",
  "type": "{tool_type}",
  "tool": {
    "name": "{function_name}",
    "description": "{function_description}",
    "params": {
      "{param_name}": {
        "type": "{param_type}",
        "description": "{param_description}"
      }
    },
    "generic_type_params": [
      "{generic_type_param}"
    ],
    "return": ["{return_value}"],
    "type": "{type_of_call}",
    "functions": "{function}",
    "address": "{contract_address}"
  }
}

Answear will like:  balance is 0
`,
                prompt: ` ${content}  ${JSON.stringify(item.tool)}`
              });
              return <BotCard name={agent.name}>
                <SmartView props={text} />
              </BotCard>
            } catch (error: any) {
              return <BotCard name={agent.name}>
                <SmartView props={error.message} />
              </BotCard>
            }

          }
        }
      };
    }

    if (item.type == 'widgetTool') {
      tool[item.type + '_' + generateId()] = {
        description: item.tool.description,
        parameters: z.object({}),
        generate: async function* () {

          return <BotCard name={agent.name}>
            <ViewFrame code={item.tool.code} />
          </BotCard>
        }
      }

    }
    return tool;
  }, {});
  const result = await streamMulti({
    model: openai('gpt-4o'),
    initial: <BotCard name={agent?.name}><SmartActionSkeleton /></BotCard>,
    system: `You name is  ${agent?.name || "Smart AI"}` + '\n\n' + agent?.prompt || '',
    messages: [
      ...aiState.get().messages.map((message: any) => ({
        role: message.role,
        content: message.content,
        name: message.name
      }))
    ],
    textComponent({ content }) {
      return <BotMessage name={agent?.name} content={content as any}></BotMessage>
    },
    onSegment: (segment: any) => {
      console.log(segment)
      if (segment.type === "tool-call") {
        // should Call twice ? , yeah
        const { args, toolName } = segment.toolCall;
        console.log(segment.toolCall)
        if (toolName.split("_")[0] == "apiTool") {
          const toolCallId = generateId();

          const toolCall = {
            id: generateId(),
            role: "assistant",
            content: [
              {
                type: "tool-call",
                toolName,
                toolCallId,
                args,
              },
            ],
          } as ClientMessage;

          const toolResult = {
            id: generateId(),
            role: "tool",
            content: [
              {
                type: "tool-result",
                toolName,
                toolCallId,
                result: "0x1::aptos_coin::AptosCoin",
              },
            ],
          } as ClientMessage;
          aiState.update({
            ...aiState.get(),
            //@ts-ignore
            messages: [...aiState.get().messages, toolCall, toolResult],
          });
        }


      } else if (segment.type === "text") {
        const text = segment.text;

        const textMessage = {
          id: generateId(),
          role: "assistant",
          content: text,
        } as ClientMessage;

        aiState.update({
          ...aiState.get(),
          //@ts-ignore
          messages: [...aiState.get().messages, textMessage],
        });
      }
    },
    onFinish: () => {
      aiState.done(aiState.get());
    },
    tools: tools,
  })
  return {
    id: nanoid(),
    display: result.ui.value
  }
}

export type AIState = {
  chatId: string
  messages: Message[]
  agentId: string
}

export type UIState = {
  id: string
  display: React.ReactNode
}[]

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [], agentId: '' },
  onGetUIState: async () => {
    'use server'

    const session: any = await auth()
    if (session && session.user) {
      const aiState = getAIState() as Chat
      const agentBot = await getAgentById(aiState.agentId)
      if (aiState) {
        const uiState = getUIStateFromAIState(aiState, agentBot)
        return uiState
      }
    } else {
      return
    }
  },
  onSetAIState: async ({ state }) => {
    'use server'
    const session: any = await auth()
    if (session && session.user) {
      const { chatId, messages, agentId } = state
      const createdAt = new Date()
      const userId = session.user.id as string
      const path = `/chat/${chatId}`

      const firstMessageContent = messages[0].content as string
      const title = firstMessageContent.substring(0, 100)
      const chat: Chat = {
        id: chatId,
        agentId,
        title,
        userId,
        createdAt,
        messages,
        path
      }
      await saveChat(chat)
    } else {
      return
    }
  }
})

export const getUIStateFromAIState = (aiState: Chat, agent: any) => {
  return aiState.messages
    .filter(message => message.role !== 'system')
    .map((message, index) => ({
      id: `${aiState.chatId}-${index}`,
      display:
        message.role === 'tool' ? (
          message.content.map(tool => {
            return tool.toolName === 'contractToolentry' ? (
              <BotCard name={agent.name}>
                {/* TODO: Infer types based on the tool result*/}
                <SmartAction props={tool.result} />
              </BotCard>
            ) : tool.toolName === 'contractToolview' ? (
              <BotCard name={agent.name}>
                {/* TODO: Infer types based on the tool result*/}
                <SmartView props={tool.result} />
              </BotCard>
            ) : tool.toolName === 'widgetTool' ? (
              <BotCard name={agent.name}>
                {/* TODO: Infer types based on the tool result*/}
                <ViewFrame code={tool.result as string} />
              </BotCard>
            ) : null
          })
        ) : message.role === 'user' ? (
          <UserMessage>{message.content as string}</UserMessage>
        ) : message.role === 'assistant' &&
          typeof message.content === 'string' ? (
          <BotMessage name={agent?.name} content={message.content} />
        ) : null
    }))
}
export type ClientMessage = CoreMessage & {
  id: string;
};