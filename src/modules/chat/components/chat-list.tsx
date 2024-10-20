import Link from 'next/link';
import { Session } from 'next-auth/types';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { UIState } from '@/libs/chat/ai.actions';

import { Separator } from '@/components/ui/separator';

export interface IChatList {
  messages: UIState;
  session: Session | null;
  isShared: boolean;
}

export function ChatList({ messages, session, isShared }: IChatList) {
  if (!messages.length) {
    return null;
  }

  return (
    <div className="flex grow flex-col gap-6 overflow-hidden">
      <div className="flex h-full flex-col gap-11 overflow-auto p-8">
        {!isShared && !session ? (
          <>
            <div className="group relative mb-4 flex items-start md:-ml-12">
              <div className="flex size-[25px] shrink-0 select-none items-center justify-center rounded-md border bg-background shadow-sm">
                <ExclamationTriangleIcon />
              </div>
              <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
                <p className="leading-normal text-muted-foreground">
                  Please{' '}
                  <Link href="/login" className="underline">
                    log in
                  </Link>{' '}
                  or{' '}
                  <Link href="/signup" className="underline">
                    sign up
                  </Link>{' '}
                  to save and revisit your chat history!
                </p>
              </div>
            </div>
            <Separator className="my-4" />
          </>
        ) : null}

        {messages.map(message => message.display && <div key={message.id}>{message.display}</div>)}
      </div>
    </div>
  );
}
