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
  title: 'AI-PGF Chatbot'
}
type PageProps = PageBaseProps;
export default async function ChatPage(_pageProps: PageProps) {
  const id = nanoid()
  const session = (await auth()) as Session
  const missingKeys = await getMissingKeys()

  return (
    <AI initialAIState={{ chatId: id, messages: [], agentId: 'testAgentId123' }}>
      <Chat id={id} session={session} missingKeys={missingKeys} />
    </AI>
  )
}
