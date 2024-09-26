'use client';

import { FC } from 'react';
import classNames from 'classnames';
import { ComponentBaseProps } from '@/common/interfaces';

import { UserChatHistoryItem } from '../interfaces/chat.interface';

import ChatPromptItem from './chat-prompt-item';

type ChatPromptListProps = ComponentBaseProps & {
  title: string;
  items: UserChatHistoryItem[]; // Define the structure of the items prop
  onItemClick?: (itemLabel: string) => void; // Function to handle item clicks
};

const ChatPromptList: FC<ChatPromptListProps> = ({ className, items, title, onItemClick }) => {
  return (
    <div className={classNames(className)}>
      <p className="border-b-2 border-[#292F36] px-7 py-6 uppercase text-gray-500">{title}</p>
      <ul className="flex flex-col gap-4 px-7 py-6">
        {items.map(item => (
          <ChatPromptItem
            key={item.id}
            className="cursor-pointer"
            title={item.title}
            onClick={() => onItemClick?.(item.id)} // Pass the item label to the click handler
          />
        ))}
      </ul>
    </div>
  );
};

export default ChatPromptList;
