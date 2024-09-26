'use client';

import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import classNames from 'classnames';
import { ComponentBaseProps } from '@/common/interfaces';
import { formatRelativeDate } from '@/common/utils/date-time.util';

import { useRouter } from '@/navigation';

import { AIChat, ChatMessage } from '../interfaces/chat.interface';

import {
  AI_CHAT_LIST,
  BOT_CHAT_MESSAGES,
  USER_CHAT_HISTORY,
  USER_CHAT_MESSAGES,
  USERS
} from '../constants/chat.constant';

import BoderImage from '@/components/common/border-image';
import DropdownSelect from '@/components/common/dropdown-select';

import { combineChatMessages } from '../utils/chat-combie.util';
import { groupChatHistoryByDate } from '../utils/chat-history.util';
import { createChatMessage, simulateBotResponse } from '../utils/chat-promt-bot.util';

import BackIcon from '@/assets/svgs/back-icon.svg';
import ChatBorderFrame from '@/assets/svgs/chat-border-frame.svg';
import EditIcon from '@/assets/svgs/edit-icon.svg';

import ChatArea from './chat-area';
import ChatPromptList from './chat-prompt-list';
import ChatPromptTextarea from './chat-prompt-textarea';

type ChatRootProps = ComponentBaseProps;

const ChatRoot: FC<ChatRootProps> = ({ className }) => {
  const [selectedOption, setSelectedOption] = useState<AIChat>(AI_CHAT_LIST[0]);
  const [conversationList, setConversationList] = useState<ChatMessage[]>([]);

  const { id: chatId } = useParams();

  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handleSelectAi = useCallback(
    (value: string) => {
      const selectedAi = AI_CHAT_LIST.find(option => option.id === value);

      if (selectedAi) {
        setSelectedOption(selectedAi);
      }
    },
    [AI_CHAT_LIST]
  );

  const aiDropdownOptionList = useMemo(
    () =>
      AI_CHAT_LIST.map(item => ({
        value: item.id,
        label: item.name
      })),
    [AI_CHAT_LIST]
  );

  const handleSend = async (message: string) => {
    setConversationList(prev => [
      ...prev,
      { id: '', message: message, avatar: '', type: 'user', creator: USERS[0].name }
    ]);

    const botResponse = await simulateBotResponse(message);

    setConversationList(prev => [
      ...prev,
      { id: '', message: botResponse, avatar: '', type: 'bot', creator: selectedOption.name }
    ]);
  };

  useEffect(() => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }, [conversationList]);

  // Inside your ChatRoot component
  useEffect(() => {
    if (chatId) {
      const userMessages = USER_CHAT_MESSAGES.filter(item => item.historyId === chatId);
      const botMessages = BOT_CHAT_MESSAGES.filter(item => item.historyId === chatId);
      const chatHistory = USER_CHAT_HISTORY.find(item => item.id === chatId);
      const bot = AI_CHAT_LIST.find(item => item.id === chatHistory?.botId);
      const combinedMessages = combineChatMessages(userMessages, botMessages);

      const newConversation = combinedMessages.map(createChatMessage);

      setConversationList(newConversation);
      setSelectedOption(bot || AI_CHAT_LIST[0]);
    }
  }, [chatId]);

  const HandlePromptItemClick = (itemId: string) => {
    router.push(`/chat/${itemId}`);
  };

  const groupedChatHistory = groupChatHistoryByDate(USER_CHAT_HISTORY);

  const handleNewChat = () => {
    router.push('/chat/new');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className={classNames('flex w-full grow flex-col overflow-hidden py-4', className)}>
      <div className="container flex grow flex-col items-center justify-center gap-6 overflow-hidden">
        <BoderImage imageBoder={ChatBorderFrame.src} className="flex w-full grow flex-col overflow-hidden border-0">
          <div className="flex h-14 w-full shrink-0 items-center justify-between border-b-2 border-[#292F36] px-7">
            <button className="h-10 w-10" onClick={handleBack}>
              <Image
                src={BackIcon.src}
                alt="Back Icon"
                className="h-full w-full translate-y-1 object-contain"
                width={BackIcon.width}
                height={BackIcon.height}
              />
            </button>
            <button className="flex h-8 items-center justify-center gap-2" onClick={handleNewChat}>
              <Image
                src={EditIcon.src}
                alt="Back Icon"
                className="h-full w-full object-contain"
                width={EditIcon.width}
                height={EditIcon.height}
              />
              <span className="text-nowrap">New Chat</span>
            </button>
          </div>
          <div className="flex grow overflow-hidden rounded-b-3xl">
            <div className="item flex h-full min-w-80 shrink-0 flex-col overflow-hidden border-r-2 border-[#292F36]">
              <div className="flex shrink-0 items-center gap-6 border-b-2 border-[#292F36] px-7 py-6 font-semibold">
                <p>AI chat</p>
                <DropdownSelect
                  initialValue={selectedOption.id}
                  options={aiDropdownOptionList}
                  onSelect={handleSelectAi}
                />
              </div>
              <div className="scrollbar flex grow flex-col overflow-auto">
                {Object.entries(groupedChatHistory).map(([date, items]) => (
                  <ChatPromptList
                    key={date}
                    title={formatRelativeDate(date)}
                    items={items}
                    onItemClick={HandlePromptItemClick}
                  />
                ))}
              </div>
            </div>
            <div className="flex grow flex-col gap-6 overflow-hidden p-8">
              <p className="shrink-0 text-center capitalize text-gray-500">{selectedOption.name}</p>

              <ChatArea conversationList={conversationList} messagesEndRef={messagesEndRef} />

              <div className="shrink-0">
                <ChatPromptTextarea placeholder={selectedOption.message} onSend={handleSend} />
              </div>
            </div>
          </div>
        </BoderImage>
      </div>
    </div>
  );
};

export default ChatRoot;
