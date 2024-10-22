'use client';

import * as React from 'react';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

import { buttonVariants } from '@/components/ui/button';
import { IconMessage, IconSpinner, IconUsers } from '@/components/ui/icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { type Chat } from 'types/chat';
import { cn } from '../utils/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Trash2Icon, SaveIcon, Share2Icon } from 'lucide-react';
import { ChatShareDialog } from './chat-share-dialog';
import { removeChat, shareChat } from '@/libs/chat/chat.actions';
import AugmentedPopup from '@/modules/augmented/components/augmented-popup';
import CustomButton from '@/libs/svg-icons/input/custom-button';

interface SidebarItemProps {
  index: number;
  chat: Chat;
}

export function SidebarItem({ index, chat }: SidebarItemProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [isRemovePending, startRemoveTransition] = React.useTransition();
  const [isShareOpen, setIsShareOpen] = React.useState<boolean>(false);

  const isActive = pathname === chat.path;
  const [newChatId, setNewChatId] = useLocalStorage('newChatId', null);
  const shouldAnimate = index === 0 && isActive && newChatId;

  if (!chat?.id) return null;

  const handleDelete = (event: any) => {
    event.preventDefault();
    // @ts-ignore
    startRemoveTransition(async () => {
      const result = await removeChat({
        id: chat.id,
        path: chat.path
      });

      if (result && 'error' in result) {
        toast.error(result.error);
        return;
      }

      setIsOpen(false);
      router.refresh();
      toast.success('Chat deleted');
    });
  };

  return (
    <Link href={chat.path} className={'flex h-20 w-full items-center'}>
      {/* <div className=" h-30 left-2 top-1 flex size-6 items-center justify-center">
        {chat.sharePath ? (
          <Tooltip delayDuration={1000}>
            <TooltipTrigger tabIndex={-1} className="focus:bg-muted focus:ring-1 focus:ring-ring">
              <IconUsers className="mr-2 mt-1 text-zinc-500" />
            </TooltipTrigger>
            <TooltipContent>This is a shared chat.</TooltipContent>
          </Tooltip>
        ) : (
          <IconMessage className="mr-2 mt-1 text-zinc-500" />
        )}
      </div> */}
      <div className="relative max-h-5 flex-1 select-none overflow-hidden text-ellipsis break-all" title={chat.title}>
        <span className="whitespace-nowrap">
          {shouldAnimate ? (
            chat.title.split('').map((character, index) => (
              <motion.span
                key={index}
                variants={{
                  initial: {
                    opacity: 0,
                    x: -100
                  },
                  animate: {
                    opacity: 1,
                    x: 0
                  }
                }}
                initial={shouldAnimate ? 'initial' : undefined}
                animate={shouldAnimate ? 'animate' : undefined}
                transition={{
                  duration: 0.25,
                  ease: 'easeIn',
                  delay: index * 0.05,
                  staggerChildren: 0.05
                }}
                onAnimationComplete={() => {
                  if (index === chat.title.length - 1) {
                    setNewChatId(null);
                  }
                }}
              >
                {character}
              </motion.span>
            ))
          ) : (
            <span>{chat.title}</span>
          )}
        </span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="ico-more-vertical shrink-0 px-3 text-xl" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="rounded-lg border-[#5F5C64] bg-[#141A20] text-white ">
          <ul>
            <li>
              <Button
                variant={'link'}
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-3 text-white hover:no-underline"
              >
                <Trash2Icon /> Delete
              </Button>
            </li>
            {/* <li>
                <Button
                  variant={'link'}
                  onClick={() => {}}
                  className="flex items-center gap-3 text-white hover:no-underline"
                >
                  <SaveIcon /> Save
                </Button>
              </li> */}
            <li>
              <Button
                variant={'link'}
                onClick={() => setIsShareOpen(true)}
                className="flex items-center gap-3 text-white hover:no-underline"
              >
                <Share2Icon /> Share
              </Button>
            </li>
          </ul>
        </DropdownMenuContent>
      </DropdownMenu>
      <ChatShareDialog
        chat={chat}
        shareChat={shareChat}
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
        onCopy={() => setIsShareOpen(false)}
      />
      <AugmentedPopup visible={isOpen} textHeading="Delete Chat" onClose={() => setIsOpen(false)}>
        <div className="p-4">
          <h2 className="text-lg font-bold">Are you absolutely sure?</h2>
          <p>This will permanently delete your chat message and remove your data from our servers.</p>
          <div className="mt-4 flex justify-end gap-4">
            <CustomButton disabled={isRemovePending} onClick={() => setIsOpen(false)}>
              <span className="text-sm">Cancel</span>
            </CustomButton>
            {/* @ts-ignore */}
            <CustomButton disabled={isRemovePending} onClick={handleDelete}>
              {isRemovePending && <IconSpinner className="mr-2 animate-spin" />}
              <span className="text-sm">Delete</span>
            </CustomButton>
          </div>
        </div>
      </AugmentedPopup>
    </Link>
  );
}
