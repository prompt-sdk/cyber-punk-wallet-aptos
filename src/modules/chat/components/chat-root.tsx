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
import { useKeylessAccount } from '@/modules/auth-aptos/context/keyless-account-context';
import { useTypingEffect } from '@/modules/auth-aptos/hooks/use-typing-effect';
import '@/modules/augmented/style.scss';
import AugmentedPopup from '@/modules/augmented/components/augmented-popup';
import FormTextField from '@/modules/form/components/form-text-field';
import { CreateToolFromContactFormSchema } from '@/modules/create-tool/validations/create-tool-from-contact-form';
import { CreateToolFromContactFormData } from '@/modules/create-tool/interfaces/create-tool.dto';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';

import axios from 'axios';

type ChatRootProps = ComponentBaseProps;

const ChatRoot: FC<ChatRootProps> = ({ className }) => {
  const { keylessAccount } = useKeylessAccount();
  const [selectedOption, setSelectedOption] = useState<AIChat>(AI_CHAT_LIST[0]);
  const [conversationList, setConversationList] = useState<ChatMessage[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [id, setId] = useState<string>(nanoid());
  const [isOpenCreateTool, setIsOpenCreateTool] = useState(false);
  const [moduleData, setModuleData] = useState<any>(null);
  const [functions, setFunctions] = useState<any>(null);
  const [sourceData, setSourceData] = useState<any>(null);
  const [isLoadingSourceData, setIsLoadingSourceData] = useState(false);

  const { id: chatId } = useParams();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handleClose = () => {
    setIsOpenCreateTool(false);
  };

  useEffect(() => {
    if (!keylessAccount) {
      router.push('/login');
    }
  }, [keylessAccount]);

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
        creator: keylessAccount?.accountAddress.toString() as string
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
      if (keylessAccount) {
        const userChats = await getChatFromKV(keylessAccount.accountAddress.toString());
        console.log('userChats', userChats);
        setChatHistory(userChats as any);
      }
    };

    fetchChats();
    //removeAllDataFromKV();
  }, [keylessAccount]);

  const saveChatToKV = async (conversationList: any) => {
    try {
      const pipeline = kv.pipeline();
      pipeline.hmset(`chat:${chatId ? (chatId as string) : id}`, conversationList);
      pipeline.zadd(`user:chat:${keylessAccount?.accountAddress.toString()}`, {
        score: Date.now(),
        member: `chat:${chatId ? (chatId as string) : id}`
      });
      await pipeline.exec();
      console.log(
        'Chat saved successfully with ID:',
        chatId ? (chatId as string) : id,
        'for user:',
        keylessAccount?.accountAddress.toString()
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
  }, [chatId, keylessAccount]);

  const HandlePromptItemClick = (itemId: string) => {
    router.push(`/chat/${itemId}`);
  };

  const handleNewChat = () => {
    router.push(`/chat/${id}`);
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  const form = useForm<CreateToolFromContactFormData>({
    resolver: zodResolver(CreateToolFromContactFormSchema),
    mode: 'onChange',
    defaultValues: {
      address: '',
      packages: [],
      functions: [],
      modules: []
    }
  });

  const { control, setValue } = form;
  const selectedModules = useWatch({ control, name: 'modules' });

  const {
    handleSubmit,
    formState: { errors, isValid },
    watch
  } = form;

  const loadSourceData = async (account: string, packages: string[], modules: string[], functions: string[]) => {
    setIsLoadingSourceData(true);
    try {
      const response = await axios.get('/api/source', {
        params: { account, package: packages.join(','), module: modules.join(','), functions: functions.join(',') }
      });
      if (response.data?.returns.length > 0) {
        setSourceData(response.data?.returns[0]);
      } else {
        setSourceData(response.data);
      }
    } catch (error) {
      console.error('Error fetching source data:', error);
    } finally {
      setIsLoadingSourceData(false);
    }
  };

  //console.log('sourceData', sourceData);

  const fetchModuleData = async (account: string) => {
    try {
      const response = await axios.get(`/api/modules?account=${account}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching module data:', error);
      return null;
    }
  };

  const fetchFunctions = async (account: string) => {
    try {
      const response = await axios.get(`/api/abis?account=${account}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching functions:', error);
      return null;
    }
  };

  const handleFetchModuleData = async () => {
    const accountAddress = form.getValues('address');
    if (accountAddress) {
      const moduleData = await fetchModuleData(accountAddress);
      const functionsData = await fetchFunctions(accountAddress);
      if (moduleData) {
        setModuleData(moduleData);
      }
      if (functionsData) {
        setFunctions(functionsData);
      }
    }
  };

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'address' && value.address) {
        handleFetchModuleData();
      }
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  //console.log('form', form.getValues());

  const handleCheckboxChange = (name: 'packages' | 'modules' | 'functions', value: string) => {
    const currentValues = form.getValues(name);
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v: string) => v !== value)
      : [...currentValues, value];
    setValue(name, newValues, { shouldValidate: true });

    if (name === 'functions') {
      const { address, packages, modules } = form.getValues();
      loadSourceData(address, packages, modules, newValues);
    }
  };

  const onSubmit = async (data: CreateToolFromContactFormData) => {
    setIsOpenCreateTool(false);
    console.log('🚀 ~ onSubmit ~ data:', data);
  };

  //console.log('functions', functions);

  return (
    <>
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
                    <ChatPromptList
                      key={idx}
                      title={item[0].message}
                      items={item}
                      onItemClick={HandlePromptItemClick}
                    />
                  ))}
                </div>
              </div>
              <div className="flex grow flex-col gap-6 overflow-hidden p-8">
                <p className="shrink-0 text-center capitalize text-gray-500">{selectedOption.name}</p>

                <ChatArea
                  conversationList={conversationList}
                  messagesEndRef={messagesEndRef}
                  userAddress={keylessAccount?.accountAddress.toString() as string}
                />

                <div className="gird-cols-2 grid shrink-0 gap-5 md:grid-cols-3">
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
                    onClick={() => setIsOpenCreateTool(true)}
                  >
                    <p className="text=[#6B7280]">{'Create tool'}</p>
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
      <AugmentedPopup visible={isOpenCreateTool} onClose={handleClose} textHeading={'Create Tool from contact'}>
        <form className="flex max-h-[80vh] flex-col gap-3 overflow-y-auto p-8">
          <FormTextField error={errors.address} form={form} label="Contract address" name="address" isValid={isValid} />

          {moduleData && (
            <div className="mb-4">
              <p className="mb-2 text-xl text-white">Packages</p>
              <div className="max-h-40 overflow-y-auto rounded border border-gray-700 p-2">
                {moduleData &&
                  moduleData.map((item: any, idx: number) => (
                    <label key={idx} className="mb-2 flex items-center text-[#6B7280]">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={form.getValues('packages').includes(item.name)}
                        onChange={() => handleCheckboxChange('packages', item.name)}
                      />
                      {item.name}
                    </label>
                  ))}
              </div>
            </div>
          )}

          {functions && (
            <div className="mb-4">
              <p className="mb-2 text-xl text-white">Modules</p>
              <div className="max-h-40 overflow-y-auto rounded border border-gray-700 p-2">
                {functions.map((item: any, idx: number) => (
                  <label key={idx} className="mb-2 flex items-center text-[#6B7280]">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={form.getValues('modules').includes(item.name)}
                      onChange={() => handleCheckboxChange('modules', item.name)}
                    />
                    {item.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          {functions && selectedModules && selectedModules?.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-xl text-white">Functions</p>
              <div className="max-h-40 overflow-y-auto rounded border border-gray-700 p-2">
                {functions
                  .filter((item: any) => selectedModules.includes(item.name))
                  .flatMap((item: any) =>
                    item.exposed_functions.map((func: any) => (
                      <label key={`${item.name}-${func.name}`} className="mb-2 flex items-center text-[#6B7280]">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={form.getValues('functions').includes(func.name)}
                          onChange={() => handleCheckboxChange('functions', func.name)}
                        />
                        {func.name}
                      </label>
                    ))
                  )}
              </div>
            </div>
          )}
          <div className="mb-4">
            <div className="">
              {isLoadingSourceData ? (
                <p>Loading source data...</p>
              ) : sourceData ? (
                <div className="flex flex-col gap-2">
                  <p className="text-white">Name: {sourceData.name}</p>
                  <div className="flex flex-col gap-2">
                    <p className="text-white">Description: </p>
                    <textarea
                      value={sourceData.description}
                      className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"
                      rows={3}
                    />
                  </div>
                  <p className="text-white">Params</p>
                  {Object.entries(sourceData.params).map(([paramName, paramData]: [string, any]) => (
                    <div key={paramName} className="flex flex-col gap-2">
                      <p className="capitalize text-white">{paramName}</p>
                      <p className="text-xs text-gray-400">{paramData.description}</p>
                      <input
                        type="text"
                        className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"
                        placeholder={`Enter ${paramName}`}
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <Button type="submit">Create</Button>
        </form>
      </AugmentedPopup>
    </>
  );
};

export default ChatRoot;
