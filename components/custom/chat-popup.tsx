'use client';

import { FC, useRef, useState } from 'react';

import AugmentedPopup from '@/components/augmented/components/augmented-popup';
import ChatPopupDecor1 from '@/public/assets/svgs/chat-popup/decor-1.svg';
import ChatPopupDecor2 from '@/public/assets/svgs/chat-popup/decor-2.svg';
import classNames from 'classnames';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { insertNewParagraph } from '../utils/chat-promt-bot.util';
import DashboardAvatar from '@/components/custom/dashboard-avatar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


type ChatPopupProps = {
  onClose?: () => void;
  inforAgent?: {
    id: string;
    name: string;
    description: string;
    introMessage: string;
    avatar: string;
    suggestedActions: {
      title: string;
      description: string;
      content: string;
    }[];
  };
  refetch?: () => void;
  className?: string;
  visible?: boolean
};

const RecentChatItem: FC<{ item: { id?: string; title: string; description: string }; agentId: string }> = ({
  item: { id, title, description },
  agentId
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

const ChatPopup: FC<ChatPopupProps> = ({ visible = false, onClose, inforAgent, refetch }) => {
  const contentEditableRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const [avatar, setAvatar] = useState(inforAgent?.avatar);
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
      router.push(`/chat?prompt=${content}&agentId=${inforAgent?.id}`);
      clearContent();
    }
  };

  // const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onloadend = async () => {
  //       // Update the avatar URL in the inforAgent state
  //       if (inforAgent) {
  //         setAvatar(reader.result as string); // Update the avatar with the new image
  //         const data = {
  //           ...inforAgent,
  //           avatar: reader.result as string
  //         };
  //         //@ts-ignore
  //         await createAgentAPI(data);
  //         refetch?.();
  //       }
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  // const createAgentAPI = async (agentData: {
  //   name: string;
  //   description: string;
  //   introMessage: string;
  //   tools: string[];
  //   widget: string[];
  //   prompt: string;
  //   user_id: string;
  // }) => {
  //   try {
  //     const response = await axios.put('/api/agent', agentData);
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error creating agent:', error);
  //     throw error;
  //   }
  // };

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
          <DashboardAvatar imageUrl={avatar || '/logo_aptos.png'} />
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
                {inforAgent?.suggestedActions &&
                  inforAgent?.suggestedActions.map((item, index) => (
                    <CarouselItem key={index} className="basis-1/2 md:basis-1/3">
                      <RecentChatItem item={item} agentId={inforAgent.id} />
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
