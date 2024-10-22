'use client';

import * as React from 'react';
import { type DialogProps } from '@radix-ui/react-dialog';
import { toast } from 'sonner';

import { ServerActionResult, type Chat } from 'types/chat';
import { Button } from '@/components/ui/button';
import { IconSpinner } from '@/components/ui/icons';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import AugmentedPopup from '@/modules/augmented/components/augmented-popup';
import CustomButton from '@/libs/svg-icons/input/custom-button';
import BorderImage from '@/components/common/border-image';
import WidgetFrame2 from '@/assets/svgs/widget-frame-2.svg';

interface ChatShareDialogProps extends DialogProps {
  chat: Pick<Chat, 'id' | 'title' | 'messages'>;
  shareChat: (id: string) => ServerActionResult<Chat>;
  onCopy: () => void;
}

export function ChatShareDialog({ chat, shareChat, onCopy, ...props }: ChatShareDialogProps) {
  const { copyToClipboard } = useCopyToClipboard({ timeout: 1000 });
  const [isSharePending, startShareTransition] = React.useTransition();

  const copyShareLink = React.useCallback(
    async (chat: Chat) => {
      if (!chat.sharePath) {
        return toast.error('Could not copy share link to clipboard');
      }

      const url = new URL(window.location.href);
      url.pathname = chat.sharePath;
      copyToClipboard(url.toString());
      onCopy();
      toast.success('Share link copied to clipboard');
    },
    [copyToClipboard, onCopy]
  );

  return (
    // @ts-ignore
    <AugmentedPopup visible={props.open} textHeading="Share link to chat" onClose={props.onOpenChange}>
      <div className="flex flex-col gap-4 p-6">
        <h2 className="text-lg font-bold">Share link to chat</h2>
        <p>Anyone with the URL will be able to view the shared chat.</p>
        <BorderImage imageBoder={WidgetFrame2.src} className="space-y-1 p-4 text-sm">
          <div className="font-medium">{chat.title}</div>
          <div className="text-muted-foreground">{chat.messages.length} messages</div>
        </BorderImage>
        <div className="flex items-center justify-end">
          <CustomButton
            disabled={isSharePending}
            onClick={() => {
              // @ts-ignore
              startShareTransition(async () => {
                const result = await shareChat(chat.id);

                if (result && 'error' in result) {
                  toast.error(result.error);
                  return;
                }

                copyShareLink(result);
              });
            }}
          >
            {isSharePending ? (
              <>
                <IconSpinner className="mr-2 animate-spin" />
                Copying...
              </>
            ) : (
              <>Copy link</>
            )}
          </CustomButton>
        </div>
      </div>
    </AugmentedPopup>
  );
}
