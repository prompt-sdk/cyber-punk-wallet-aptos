'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Session } from 'next-auth/types';
import { useAIState, useUIState } from 'ai/rsc';
import { toast } from 'sonner';
import { Message } from 'types/chat';

import { useLocalStorage } from '@/hooks/use-local-storage';
import { useScrollAnchor } from '@/hooks/use-scroll-anchor';

import { ChatList } from '@/modules/chat/components/chat-list';
import { ChatPanel } from '@/modules/chat/components/chat-panel';
import { EmptyScreen } from '@/modules/chat/components/empty-screen';

import { cn } from '../utils/utils';

export interface IChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[];
  id?: string;
  session: Session | null;
  missingKeys: string[];
}

export function Chat({ id, className, session, missingKeys }: IChatProps) {
  const router = useRouter();
  const path = usePathname();
  const [input, setInput] = useState('');
  const [messages] = useUIState();
  const [aiState] = useAIState();

  const [_, setNewChatId] = useLocalStorage('newChatId', id);

  console.log('🚀 ~ Chat ~ _:', _);

  useEffect(() => {
    if (session?.user) {
      if (!path.includes('chat') && messages.length === 1) {
        window.history.replaceState({}, '', `/chat/${id}`);
      }
    }
  }, [id, path, session?.user, messages]);

  useEffect(() => {
    const messagesLength = aiState.messages?.length;

    if (messagesLength === 2) {
      router.refresh();
    }
  }, [aiState.messages, router]);

  useEffect(() => {
    setNewChatId(id);
  });

  useEffect(() => {
    missingKeys.map(key => {
      toast.error(`Missing ${key} environment variable!`);
    });
  }, [missingKeys]);

  const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } = useScrollAnchor();

  return (
    <div
      ref={scrollRef}
      className="scrollbar group w-full overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]"
    >
      <div ref={messagesRef} className={cn('pb-[200px] pt-4 md:pt-10', className)}>
        {messages.length ? <ChatList messages={messages} isShared={false} session={session} /> : <EmptyScreen />}
        <div ref={visibilityRef} className="h-px w-full" />
      </div>
      <ChatPanel id={id} input={input} setInput={setInput} isAtBottom={isAtBottom} scrollToBottom={scrollToBottom} />
    </div>
  );
}
