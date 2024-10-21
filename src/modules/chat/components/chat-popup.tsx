'use client';

import { FC, useRef, useState } from 'react';
import { ComponentBaseProps } from '@/common/interfaces';

import AugmentedPopup from '@/modules/augmented/components/augmented-popup';
import ChatPopupDecor1 from '@/assets/svgs/chat-popup/decor-1.svg';
import ChatPopupDecor2 from '@/assets/svgs/chat-popup/decor-2.svg';
import classNames from 'classnames';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { insertNewParagraph } from '../utils/chat-promt-bot.util';
import DashboardAvatar from '@/modules/dashboard/components/dashboard-avatar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type ChatPopupProps = ComponentBaseProps & {
  onClose?: () => void;
  inforAgent?: {
    _id: Object;
    name: string;
    description: string;
    introMessage: string;
    avatar: string;
    messenge_template: {
      title: string;
      description: string;
      content: string;
    }[];
  };
};

const RecentChatItem: FC<{ item: { id?: string; title: string; description: string }, agentId: string }> = ({
  item: { id, title, description }, agentId
}) => {
  return (
    <Link
      href={`/chat?prompt=${description}&agentId=${agentId}`}
      data-augmented-ui
      className={classNames(
        'border-none outline-none',
        'aug-tl1-2 aug-clip-tl',
        'aug-border-bg-secondary aug-border aug-border-2 bg-[#2C3035] p-3',
        'aug-round-r1 aug-round-bl1 aug-tr1-8 aug-br1-8 aug-bl1-8 p-4',
        'flex cursor-pointer flex-col gap-2'
      )}
    >
      <p className="text=[#6B7280]">{title}</p>
      <p className="text-[#9CA3AF]">{description.length > 15 ? description.slice(0, 15) + '...' : description}</p>
    </Link>
  );
};

const RECENT_CHATS = [
  {
    id: '1',
    title: 'Swap USDC',
    description: 'For APT'
  },
  {
    id: '2',
    title: 'Swap USDC',
    description: 'For APT'
  },
  {
    id: '3',
    title: 'Swap USDC',
    description: 'For APT'
  },
  {
    id: '4',
    title: 'Swap USDC',
    description: 'For APT'
  }
];

const ChatPopup: FC<ChatPopupProps> = ({ visible = false, onClose, inforAgent }) => {
  const contentEditableRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const [isEmpty, setIsEmpty] = useState(true);

  const clearContent = () => {
    if (contentEditableRef.current) {
      contentEditableRef.current.innerHTML = '';
      setIsEmpty(true);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      if (event.shiftKey) {
        insertNewParagraph();
      } else {
        event.preventDefault();
      }
    }
  };

  const handleInput = () => {
    const content = contentEditableRef.current?.innerHTML || '';

    setIsEmpty(!content.length);
  };

  const handleSend = () => {
    const content = contentEditableRef.current?.innerHTML || '';

    if (content) {
      router.push(`/chat?prompt=${content}&agentId=${inforAgent?._id.toString()}`);
      clearContent();
    }
  };

  return (
    <AugmentedPopup
      className="max-w-3xl"
      visible={visible}
      onClose={onClose}
      textHeading={'Execute Transactions with AI'}
    >
      <div className="relative w-full">
        <img
          src={ChatPopupDecor1.src}
          alt="Chat Popup Decor 1"
          width={ChatPopupDecor1.width}
          height={ChatPopupDecor1.height}
          className="absolute left-3 top-4"
        />
        <img
          src={ChatPopupDecor2.src}
          alt="Chat Popup Decor 2"
          width={ChatPopupDecor2.width}
          height={ChatPopupDecor2.height}
          className="absolute bottom-4 left-3"
        />
        <div className="absolute left-6 top-2 flex flex-row items-center gap-2">
          <DashboardAvatar imageUrl={inforAgent?.avatar} />
          <div className="flex flex-col gap-1">
            <p className="text-lg font-semibold text-white">{inforAgent?.name}</p>
            <p className="text-[#9CA3AF]">{inforAgent?.description}</p>
          </div>
        </div>
        <div className="flex w-full flex-col gap-6 p-8 pt-28">
          <div className="flex flex-col gap-3">
            <p>Chat Templates</p>

            <Carousel opts={{ align: 'start', loop: true }} className={classNames('w-full')}>
              <CarouselContent>
                {inforAgent?.messenge_template && inforAgent?.messenge_template.map((item, index) => (
                  <CarouselItem key={index} className="basis-1/2 md:basis-1/3">
                    <RecentChatItem item={item} agentId={inforAgent._id.toString()} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
          <div className="flex w-full items-start justify-between rounded-[8px] border-[1px] border-[#292F36] bg-[#141A20] px-4 py-5">
            <div className="relative flex-1 text-gray-50">
              {isEmpty && (
                <div className="pointer-events-none absolute left-0 top-0 text-[#6B7280]">
                  {'Messege Smart Actions'}
                </div>
              )}
              <div
                ref={contentEditableRef}
                contentEditable
                className={classNames('h-[100px] overflow-y-auto bg-[#141A20]')}
                style={{ outline: 'none' }}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>
          <button
            data-augmented-ui
            onClick={handleSend}
            className={classNames(
              'border-none outline-none',
              'aug-tl1-12 aug-clip-tl1 aug-clip-br1 aug-br1-12',
              'aug-border-bg-secondary aug-border aug-border-2 bg-[#2C3035] p-3',
              'aug-round-tr1 aug-round-bl1 aug-tr1-4 aug-bl1-4',
              'ml-auto flex w-fit flex-col gap-2 px-5 py-3 font-bold',
              'transition-all duration-200 ease-in-out hover:bg-white hover:text-slate-600'
            )}
            disabled={isEmpty} // {{ edit_1 }} Disable button if content is empty
          >
            Send Message
          </button>
        </div>
      </div>
    </AugmentedPopup>
  );
};

export default ChatPopup;
