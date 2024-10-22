import 'server-only'

import {
  createAI,
  getMutableAIState,
  getAIState,
  streamUI,
  createStreamableValue,

} from 'ai/rsc'
import { openai } from '@ai-sdk/openai'
import { getTools, getAgentById } from '../db/store-mongodb';
import { BotCard, BotMessage } from '@/modules/chat/components/chat-card';
import { z } from 'zod'
import { SmartActionSkeleton } from '@/modules/chat/components/smartaction/action-skeleton'
import {
  sleep,
  nanoid
} from '@/modules/chat/utils/utils'
import { generateText } from 'ai';
import { saveChat } from '@/libs/chat/chat.actions'
import { SpinnerMessage, UserMessage } from '@/modules/chat/components/chat-card';
import { Chat, Message } from 'types/chat'
import { auth } from '@/modules/auth/constants/auth.config';
import { SmartAction, SmartView } from '@/modules/chat/components/smartaction/action'
import { getAptosClient } from '@/modules/chat/utils/aptos-client';

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
  const tool_ids = agent.tool_ids
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
    if (type == 'generic') return
    if (type == 'Type') return
    if (type == 'TypeInfo') return
    return z.string().describe(describe)
  }

  const tools = dataTools.reduce((tool: any, item: any) => {

    if (item.type == 'contractTool') {
      const filteredObj = Object.keys(item.tool.params).reduce((acc: any, key: any) => {
        acc[key] = key = zodExtract(item.tool.params[key].type, item.tool.params[key].description);
        return acc;
      }, {})
      const ParametersSchema: any = Object.fromEntries(
        Object.entries(filteredObj).filter(([key, value]) => value !== undefined)
      );
      type ParametersData = z.infer<typeof ParametersSchema>;
      tool[item._id.toString()] = {
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
            const toolCallId = nanoid()
            aiState.done({
              ...aiState.get(),
              messages: [
                //@ts-ignore
                ...aiState.get().messages,
                {
                  id: nanoid(),
                  role: 'assistant',
                  content: [
                    //@ts-ignore
                    {
                      type: 'tool-call',
                      toolName: item.type + item.tool.type,
                      toolCallId,
                      args: ParametersData
                    }
                  ]
                },
                {
                  id: nanoid(),
                  role: 'tool',
                  content: [
                    //@ts-ignore
                    {
                      type: 'tool-result',
                      toolName: item.type + '_' + item.tool.type,
                      toolCallId,
                      result: data
                    }
                  ]
                }
              ]
            })

            return (
              <BotCard name={agent.name}>
                <SmartAction props={data} />
              </BotCard>
            )
          }
          if (item.tool.type == 'view') {


            const data = {
              functionArguments: Object.values(ParametersData).map((item: any) =>
                typeof item === 'number' ? BigInt(item * 10 ** 18) : item
              ),
              function: item.name,
              typeArguments: item.tool.generic_type_params
            }

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

            const toolCallId = nanoid()

            aiState.done({
              ...aiState.get(),
              messages: [
                //@ts-ignore
                ...aiState.get().messages,
                {
                  id: nanoid(),
                  role: 'assistant',
                  content: [
                    //@ts-ignore
                    {
                      type: 'tool-call',
                      toolName: item.type + item.tool.type,
                      toolCallId,
                      args: ParametersData
                    }
                  ]
                },
                {
                  id: nanoid(),
                  role: 'tool',
                  content: [
                    //@ts-ignore
                    {
                      type: 'tool-result',
                      toolName: item.type + item.tool.type,
                      toolCallId,
                      result: data
                    }
                  ]
                }
              ]
            })

            return <BotCard name={agent.name}>
              <SmartView props={text} />
            </BotCard>
          }
        }
      };
    }
    if (item.type == 'widgetTool') {
      console.log(item)
      return <BotCard name={agent.name}>
        <SmartView props={'123'} />
      </BotCard>
    }
    return tool;
  }, {});

  const result = await streamUI({
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
    text: ({ content, done, delta }) => {

      if (!textStream) {
        textStream = createStreamableValue('')
        textNode = <BotMessage name={agent?.name} content={textStream.value} />
      }
      if (done) {
        textStream.done()
        aiState.done({
          ...aiState.get(),
          messages: [
            ...aiState.get().messages,
            {
              id: nanoid(),
              role: 'assistant',
              content
            }
          ]
        })
      } else {
        textStream.update(delta)
      }

      return textNode
    },
    tools: tools,
  })
  return {
    id: nanoid(),
    display: result.value
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
