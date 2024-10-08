import { FC, useState } from 'react';
import Image from 'next/image';
import classNames from 'classnames';
import { motion } from 'framer-motion';
import { ComponentBaseProps } from '@/common/interfaces';

import BoderImage from '@/components/common/border-image';
import ChatSend from '@/modules/chat/components/chat-send';
import AngleDownIcon from '@/assets/svgs/angle-down-icon.svg';
import ChatBotResponseFrame from '@/assets/svgs/chat-bot-response-frame.svg';
import ChatUserMessageFrame from '@/assets/svgs/chat-user-message-frame.svg';
import { useEffect } from 'react';
import { kv } from '@vercel/kv';

type ChatMessageItemProps = ComponentBaseProps & {
  item: { id: string; creator: string; message: string; type: string };
  isUser: boolean;
};

const ChatMessageItem: FC<ChatMessageItemProps> = ({ item, isUser }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // const saveChatToKV = async (item: { id: string; creator: string; message: string; type: string }) => {
  //   try {
  //     const pipeline = kv.pipeline();
  //     const chatId = `chat_${Date.now()}`;
  //     pipeline.hmset(`chat:${chatId}`, item);
  //     pipeline.zadd(`user:chat:${item.creator}`, {
  //       score: Date.now(),
  //       member: `chat:${chatId}`
  //     });
  //     await pipeline.exec();
  //     console.log('Chat saved successfully with ID:', chatId, 'for user:', item.creator);
  //   } catch (error) {
  //     console.error('Error saving chat to KV:', error);
  //   }
  // };

  // useEffect(() => {
  //   if (item) {
  //     saveChatToKV(item);
  //   }
  // }, [item]);

  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev); // Toggle the collapse state
  };

  const sliceAddress = (address: string): string => {
    if (address.length <= 8) return address;
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <BoderImage
      className={classNames('border-0 text-gray-400', isUser ? 'text-right' : '')}
      imageBoder={isUser ? ChatUserMessageFrame.src : ChatBotResponseFrame.src}
    >
      <div
        className={classNames(
          'flex items-center justify-between border-b-[1px] border-[#292F36] px-4 py-3',
          isUser ? 'flex-row-reverse' : 'flex-row'
        )}
      >
        <div className={classNames('grow font-bold', isUser ? '' : 'text-cyan-500')}>
          {isUser ? sliceAddress(item.creator) : item.creator}
        </div>
        <button className="shrink-0" onClick={toggleCollapse}>
          <Image
            src={AngleDownIcon.src}
            alt="Angle Down Icon"
            width={AngleDownIcon.width}
            height={AngleDownIcon.height}
            className="translate-y-1"
          />
        </button>
      </div>
      <motion.div
        className="overflow-hidden "
        // initial={{ height: 0 }}
        animate={{ height: isCollapsed ? 0 : 'auto' }}
        transition={{ duration: 0.3 }}
      >
        {item.message.startsWith('Transfer request:') ? (
          <ChatSend
            address={item.message.split(' to ')[1]}
            amount={item.message.split('Transfer request: ')[1].split(' APT')[0]}
          />
        ) : (
          <div className="px-4 py-3" dangerouslySetInnerHTML={{ __html: item.message }} />
        )}
      </motion.div>
    </BoderImage>
  );
};

export default ChatMessageItem;
