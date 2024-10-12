'use client';

import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import classNames from 'classnames';
import { ComponentBaseProps } from '@/common/interfaces';
import { formatRelativeDate } from '@/common/utils/date-time.util';
import { kv } from '@vercel/kv';
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

import { nanoid } from '../utils/utils';

import { useWallet } from '@aptos-labs/wallet-adapter-react';
import ChatPromptItem from './chat-prompt-item';
type ChatRootProps = ComponentBaseProps;

const ChatRoot: FC<ChatRootProps> = ({ className }) => {
  const [selectedOption, setSelectedOption] = useState<AIChat>(AI_CHAT_LIST[0]);
  const [conversationList, setConversationList] = useState<ChatMessage[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [id, setId] = useState<string>(nanoid());

  const { id: chatId } = useParams();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const { account, connected, disconnect, wallet } = useWallet();

  useEffect(() => {
    if (!connected) {
      router.push('/login');
    }
  }, [connected]);

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
      {
        id: chatId ? (chatId as string) : id,
        message: message,
        avatar: '',
        type: 'user',
        creator: account?.address.toString() as string
      }
    ]);

    const botResponse = await simulateBotResponse(message);

    setConversationList(prev => [
      ...prev,
      {
        id: chatId ? (chatId as string) : id,
        message: botResponse,
        avatar: '',
        type: 'bot',
        creator: selectedOption.name
      }
    ]);
  };

  const removeAllDataFromKV = async () => {
    try {
      // Get all keys in the database
      const allKeys = await kv.keys('*');

      // Delete all keys
      const pipeline = kv.pipeline();
      for (const key of allKeys) {
        pipeline.del(key);
      }

      // Execute the pipeline
      await pipeline.exec();

      console.log('All data has been removed from the database');
    } catch (error) {
      console.error('Error removing data from KV:', error);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }, [conversationList]);

  const getChatFromKV = async (userId: string) => {
    try {
      // Get the chat IDs for the user
      const chatIds = await kv.zrange(`user:chat:${userId}`, 0, -1, { rev: true });

      // Fetch chat details for each chat ID
      const chats = await Promise.all(
        chatIds.map(async chatId => {
          const chatDetails = await kv.hgetall(chatId as string);
          return chatDetails;
        })
      );

      // Filter out any null results
      const validChats = chats.filter(chat => chat !== null);

      return validChats;
    } catch (error) {
      console.error('Error fetching chats from KV:', error);
      return [];
    }
  };

  useEffect(() => {
    const fetchChats = async () => {
      if (account) {
        const userChats = await getChatFromKV(account.address.toString());
        console.log('userChats', userChats);
        setChatHistory(userChats as any);
      }
    };

    fetchChats();
    //removeAllDataFromKV();
  }, [account]);

  const saveChatToKV = async (conversationList: any) => {
    try {
      const pipeline = kv.pipeline();
      pipeline.hmset(`chat:${chatId ? (chatId as string) : id}`, conversationList);
      pipeline.zadd(`user:chat:${account?.address.toString()}`, {
        score: Date.now(),
        member: `chat:${chatId ? (chatId as string) : id}`
      });
      await pipeline.exec();
      console.log(
        'Chat saved successfully with ID:',
        chatId ? (chatId as string) : id,
        'for user:',
        account?.address.toString()
      );
    } catch (error) {
      console.error('Error saving chat to KV:', error);
    }
  };

  useEffect(() => {
    if (conversationList.length > 0) {
      saveChatToKV(conversationList);
      if (!chatId) {
        if (conversationList.length > 1) {
          router.push(`/chat/${id}`);
        }
      }
    }
  }, [conversationList, chatId, id]);

  // Inside your ChatRoot component
  useEffect(() => {
    const fetchChatFromDatabase = async () => {
      if (chatId) {
        try {
          const chat = await kv.hgetall(`chat:${chatId}`);
          // console.log('chatId:', chatId);
          // console.log('chat:', chat);
          if (chat) {
            setConversationList(Object.values(chat as any));
          }
        } catch (error) {
          console.error('Error fetching chat from database:', error);
        }
      }
    };

    fetchChatFromDatabase();
  }, [chatId, account]);

  const HandlePromptItemClick = (itemId: string) => {
    router.push(`/chat/${itemId}`);
  };

  const handleNewChat = () => {
    router.push(`/chat/${id}`);
  };

  const handleBack = () => {
    router.push('/dashboard');
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
                {chatHistory.map((item: any, idx: number) => (
                  <ChatPromptList key={idx} title={item[0].message} items={item} onItemClick={HandlePromptItemClick} />
                ))}
                {chatHistory.length > 0 && (
                  <ChatPromptItem
                    className="cursor-pointer"
                    title={'New Chat'}
                    onClick={() => {}} // Pass the item label to the click handler
                  />
                )}
              </div>
            </div>
            <div className="flex grow flex-col gap-6 overflow-hidden p-8">
              <p className="shrink-0 text-center capitalize text-gray-500">{selectedOption.name}</p>

              <ChatArea
                conversationList={conversationList}
                messagesEndRef={messagesEndRef}
                userAddress={account?.address.toString() as string}
              />

              <div className="grid shrink-0 grid-cols-2 gap-5">
                <div
                  data-augmented-ui
                  className={classNames(
                    'border-none outline-none',
                    'aug-tl1-2 aug-clip-tl',
                    'aug-border-bg-secondary aug-border aug-border-2 bg-[#2C3035] p-3',
                    'aug-round-r1 aug-round-bl1 aug-tr1-8 aug-br1-8 aug-bl1-8 p-4',
                    'flex cursor-pointer flex-col gap-2'
                  )}
                  onClick={() => {}}
                >
                  <p className="text=[#6B7280]">{'Select tool'}</p>
                  <p className="text-[#9CA3AF]">{'For APT'}</p>
                </div>
                <div
                  data-augmented-ui
                  className={classNames(
                    'border-none outline-none',
                    'aug-tl1-2 aug-clip-tl',
                    'aug-border-bg-secondary aug-border aug-border-2 bg-[#2C3035] p-3',
                    'aug-round-r1 aug-round-bl1 aug-tr1-8 aug-br1-8 aug-bl1-8 p-4',
                    'flex cursor-pointer flex-col gap-2'
                  )}
                  onClick={() => {}}
                >
                  <p className="text=[#6B7280]">{'Select widget'}</p>
                  <p className="text-[#9CA3AF]">{'For APT'}</p>
                </div>
              </div>
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
