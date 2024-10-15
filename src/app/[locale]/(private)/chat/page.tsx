import { PageBaseProps } from '@/common/interfaces';
import { type Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/modules/auth/constants/auth.config';
import { getChat, getMissingKeys } from '@/libs/chat/chat.actions'
import { Chat } from '@/modules/chat/components/chat-ui'
import { AI } from '@/libs/chat/ai.actions'
import { Session } from 'types/chat'
import { nanoid } from '@/modules/chat/utils/utils';

export const metadata = {
  title: 'Prompt Wallet'
}

export interface ChatPageProps {
  params: {
    agentId: string
    prompt: string
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const id = nanoid()
  const session = (await auth()) as Session
  const missingKeys = await getMissingKeys()
  // if have widget ID 
  // get Tools fromt widget
  // create agent with tool
  //  
  return (
    <AI initialAIState={{ chatId: id, messages: [], agentId: params.agentId }}>
      <Chat id={id} session={session} missingKeys={missingKeys} />
    </AI>
  )
}
