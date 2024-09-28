'use client';

import { PageBaseProps } from '@/common/interfaces';

import ChatRoot from '@/modules/chat/components/chat-root';

type PageProps = PageBaseProps;
export default function ChatPage(_pageProps: PageProps) {
  return <ChatRoot />;
}
