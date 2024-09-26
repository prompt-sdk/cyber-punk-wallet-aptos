'use client';

import { FC } from 'react';
import Image from 'next/image';
import classNames from 'classnames';

import { ChatMessage } from '../interfaces/chat.interface';

import BotIcon from '@/assets/svgs/bot-icon.svg';
import UserIcon from '@/assets/svgs/user-icon.svg';

import ChatMessageItem from './chat-message-item';

type ChatAreaProps = {
  conversationList: ChatMessage[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
};

const ChatArea: FC<ChatAreaProps> = ({ conversationList, messagesEndRef }) => {
  return (
    <div className="scrollbar flex h-full flex-col gap-11 overflow-auto">
      {conversationList.map((item, index) => {
        const isUser = item.type === 'user';

        return (
          <div
            key={`${item.id}-${index}`}
            className={classNames('flex gap-4', isUser ? 'flex-row-reverse' : 'flex-row')}
          >
            <Image
              src={isUser ? UserIcon.src : BotIcon.src}
              alt="User Icon"
              width={UserIcon.width}
              height={UserIcon.height}
              className="h-10 w-10 shrink-0"
            />
            <div className="grow">
              <ChatMessageItem item={item} isUser={isUser} />
            </div>
            <div className="h-10 w-10 shrink-0" />
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatArea;
