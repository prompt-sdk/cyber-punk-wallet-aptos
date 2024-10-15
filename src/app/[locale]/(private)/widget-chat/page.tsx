import { PageBaseProps } from '@/common/interfaces';
import { type Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/modules/auth/constants/auth.config';
import { getChat, getMissingKeys } from '@/libs/chat/chat.actions'
import { Chat } from '@/modules/chat/components/chat-ui'
import { AI } from '@/libs/chat/ai.actions'
import { Session } from 'types/chat'
import { nanoid } from '@/modules/chat/utils/utils';
import { getToolIdByWidget, creatAgentWithTool } from '@/libs/db/store-mongodb';

export const metadata = {
  title: 'Prompt Wallet'
}

export interface ChatPageProps {
  params: {
    agentId: string
    prompt: string
    widgetId: string
  }
}

export default async function WidgetChatPage({ params }: ChatPageProps) {
  const id = nanoid()
  const session: any = (await auth()) as Session
  const missingKeys = await getMissingKeys()
  // if have widget ID 
  let agentId = null;
  if (params.widgetId) {
    // get Tools fromt widget
    const tool_ids = await getToolIdByWidget(params.widgetId);
    // create agent with tool
    const data: any = {
      "name": "Smart Action",
      "prompt": ` You are a Helpful developer.\n 
            Analyze each query to determine if it requires plain text information or an action via a tool. Do not ever send tool call arguments with your chat. You must specifically call the tool with the information\n
            For informational queries like "create label show balance of 0x123123123", respond with text, then balance of account you answered with using the 'getBlanace'. Always say something before or after tool usage.\n
            Provide a response clearly and concisely. Always be polite, informative, and efficient.`,
      "introMessage": "Im Aptos Bot",
      "widget": [],
      "user_id": session.user.username,
      "tools": tool_ids,
      "description": "This bot will excute transaction"
    };
    agentId = await creatAgentWithTool(data);
  }

  console.log("agentId", agentId, params.agentId)
  return (
    <AI initialAIState={{ chatId: id, messages: [], agentId: agentId?.toString() || params.agentId }}>
      <Chat id={id} session={session} missingKeys={missingKeys} />
    </AI>
  )
}
