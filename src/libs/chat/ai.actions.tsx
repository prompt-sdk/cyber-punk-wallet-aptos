import 'server-only'

import {
  createAI,
  getMutableAIState,
  getAIState,
  streamUI,
  createStreamableValue,

} from 'ai/rsc'
import { openai } from '@ai-sdk/openai'
import { getTools, getToolIdByAgent } from '../db/store-mongodb';
import { BotCard, BotMessage } from '@/modules/chat/components/chat-card';

import { generateText } from 'ai';
import { z } from 'zod'
import { SmartActionSkeleton } from '@/modules/chat/components/smartaction/action-skeleton'
import {
  sleep,
  nanoid
} from '@/modules/chat/utils/utils'

import { saveChat } from '@/libs/chat/chat.actions'
import { SpinnerMessage, UserMessage } from '@/modules/chat/components/chat-card';
import { Chat, Message } from 'types/chat'
import { auth } from '@/modules/auth/constants/auth.config';
import { SmartAction } from '@/modules/chat/components/smartaction/action'
import { getAptosBalance } from '@/libs/aptos/aptos-utils'
import dynamic from 'next/dynamic';

const SendAptButton = dynamic(() => import('@/modules/chat/components/send-apt-button').then(mod => mod.SendAptButton), { ssr: false });

async function submitUserMessage(content: string) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()
  const session = await auth()

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

  const gettools: any = await getToolIdByAgent(aiState.get().agentId)
  const dataTools = await getTools(gettools);

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
    if (type == 'generic') return null
    return z.string().describe(describe)
  }

  const tools = {
    ...dataTools.reduce((tool: any, item: any) => {
      if (item.type == 'contractTool') {
        const ParametersSchema = Object.keys(item.tool.params).reduce((acc: any, key: any) => {
          acc[key] = key = zodExtract(item.tool.params[key].type, item.tool.params[key].description);
          return acc;
        }, {})
        type ParametersData = z.infer<typeof ParametersSchema>;
        tool[item._id.toString()] = {
          description: item.tool.description,
          parameters: z.object(ParametersSchema),
          generate: async function* (ParametersData: ParametersData) {
            if (item.tool.type == 'entry') {
              yield (
                <BotCard>
                  <SmartActionSkeleton />
                </BotCard>
              )

              await sleep(1000)

              const toolCallId = nanoid()
              aiState.done({
                ...aiState.get(),
                messages: [
                  ...aiState.get().messages,
                  {
                    id: nanoid(),
                    role: 'assistant',
                    content: [
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
                      {
                        type: 'tool-result',
                        toolName: item.type + item.tool.type,
                        toolCallId,
                        result: ParametersData
                      }
                    ]
                  }
                ]
              })

              return (
                <BotCard>
                  <BotCard>
                    <SmartAction props={ParametersData} />
                  </BotCard>
                </BotCard>
              )

            }
            if (item.tool.type == 'view') {
              yield (
                <BotCard>
                  <SmartActionSkeleton />
                </BotCard>
              )

              await sleep(1000)

              const toolCallId = nanoid()
              const { text } = await generateText({
                model: openai('gpt-4o'),
                system: `This function retrieves the balance of a specified owner for a given CoinType, including any paired fungible asset balance if it exists. It sums the balance of the coin and the balance of the fungible asset, providing a comprehensive view of the owner's total holdings`,
                prompt: '0.4'
              });

              aiState.done({
                ...aiState.get(),
                messages: [
                  ...aiState.get().messages,
                  {
                    id: nanoid(),
                    role: 'assistant',
                    content: [
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
                      {
                        type: 'tool-result',
                        toolName: item.type + item.tool.type,
                        toolCallId,
                        result: text
                      }
                    ]
                  }
                ]
              })

              return <BotCard>
                <BotCard>
                  <SmartAction props={text} />
                </BotCard>
              </BotCard>
            }
          }
        };
      }
      if (item.type == 'widgetTool') {

      }

      return tool;
    }, {}),
    // Add a new tool for getting APT balance
    getAptBalance: {
      description: "Get the APT balance for the user",
      parameters: z.object({}),
      generate: async function* () {
        yield (
          <BotCard>
            <SmartActionSkeleton />
          </BotCard>
        )

        await sleep(1000)

        let address = '0x1'; // Default address if session or username is not available
        if (session && session.user && session.user.username) {
          address = session.user.username;
        }

        const balance = await getAptosBalance(address);
        const formattedBalance = parseFloat(balance).toFixed(2);

        const toolCallId = nanoid()
        aiState.done({
          ...aiState.get(),
          messages: [
            ...aiState.get().messages,
            {
              id: nanoid(),
              role: 'assistant',
              content: [
                {
                  type: 'tool-call',
                  toolName: 'getAptBalance',
                  toolCallId,
                  args: {}
                }
              ]
            },
            {
              id: nanoid(),
              role: 'tool',
              content: [
                {
                  type: 'tool-result',
                  toolName: 'getAptBalance',
                  toolCallId,
                  result: formattedBalance
                }
              ]
            }
          ]
        })

        return (
          <BotCard>
            <BotMessage content={`Your balance is ${formattedBalance} APT`} />
          </BotCard>
        )
      }
    },
    sendApt: {
      description: "Create a button to send a specified amount of APT to a specified address",
      parameters: z.object({
        toAddress: z.string().describe("The address to send APT to"),
        amount: z.string().describe("The amount of APT to send")
      }),
      generate: async function* ({ toAddress, amount }: { toAddress: string, amount: string }) {
        yield (
          <BotCard>
            <SmartActionSkeleton />
          </BotCard>
        )

        await sleep(1000)

        const toolCallId = nanoid()
        aiState.done({
          ...aiState.get(),
          messages: [
            ...aiState.get().messages,
            {
              id: nanoid(),
              role: 'assistant',
              content: [
                {
                  type: 'tool-call',
                  toolName: 'sendApt',
                  toolCallId,
                  args: { toAddress, amount }
                }
              ]
            },
            {
              id: nanoid(),
              role: 'tool',
              content: [
                {
                  type: 'tool-result',
                  toolName: 'sendApt',
                  toolCallId,
                  result: `Button created to send ${amount} APT to ${toAddress}`
                }
              ]
            }
          ]
        })

        return (
          <BotCard>
            <BotMessage content={`Here's a button to send ${amount} APT to ${toAddress}:`} />
            <SendAptButton toAddress={toAddress} amount={amount} />
          </BotCard>
        )
      }
    }
  };

  //get agentId a iState.get().agentId
  const result = await streamUI({
    model: openai('gpt-4o'),
    initial: <SpinnerMessage />,
    system: ` You are a Helpful developer.\n 
            Analyze each query to determine if it requires plain text information or an action via a tool. Do not ever send tool call arguments with your chat. You must specifically call the tool with the information\n
            For informational queries like "show my balance", use the 'getAptBalance' tool to fetch and display the user's APT balance. The tool will automatically use the user's address from their session.\n
            When the user wants to send APT, use the 'sendApt' tool to create a button for sending the specified amount of APT to the specified address. Make sure to extract both the amount and the recipient address from the user's message.\n
            Always say something before or after tool usage.\n
            Provide a response clearly and concisely. Always be polite, informative, and efficient.`,
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
        textNode = <BotMessage content={textStream.value} />
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

    const session = await auth()

    if (session && session.user) {
      const aiState = getAIState() as Chat

      if (aiState) {
        const uiState = getUIStateFromAIState(aiState)
        return uiState
      }
    } else {
      return
    }
  },
  onSetAIState: async ({ state }) => {
    'use server'

    const session = await auth()
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

export const getUIStateFromAIState = (aiState: Chat) => {
  return aiState.messages
    .filter(message => message.role !== 'system')
    .map((message, index) => ({
      id: `${aiState.chatId}-${index}`,
      display:
        message.role === 'tool' ? (
          message.content.map(tool => {
            return tool.toolName === 'contractToolentry' ? (
              <BotCard>
                {/* TODO: Infer types based on the tool result*/}
                <SmartAction props={tool.result} />
              </BotCard>
            ) : tool.toolName === 'contractToolview' ? (
              <BotCard>
                {/* TODO: Infer types based on the tool result*/}
                <SmartAction props={tool.result} />
              </BotCard>
            ) : null
          })
        ) : message.role === 'user' ? (
          <UserMessage>{message.content as string}</UserMessage>
        ) : message.role === 'assistant' &&
          typeof message.content === 'string' ? (
          <BotMessage content={message.content} />
        ) : null
    }))
}
