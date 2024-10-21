import * as React from 'react';

import { shareChat } from '@/libs/chat/chat.actions';
import { Button } from '@/components/ui/button';
import { PromptForm } from './prompt-form';
import { ButtonScrollToBottom } from './button-scroll-to-bottom';
import { IconShare } from '@/components/ui/icons';
import { FooterText } from './footer';
import { ChatShareDialog } from './chat-share-dialog';
import { useAIState, useActions, useUIState } from 'ai/rsc';
import type { AI } from '@/libs/chat/ai.actions';
import { nanoid } from 'nanoid';
import { UserMessage } from '@/modules/chat/components/chat-card';
import { useSearchParams } from 'next/navigation'
import classNames from 'classnames';
import '@/modules/augmented/style.scss';
import axios from 'axios';

export interface ChatPanelProps {
  id?: string;
  title?: string;
  input: string;
  setInput: (value: string) => void;
  isAtBottom: boolean;
  scrollToBottom: () => void;
}

export function ChatPanel({ id, title, input, setInput, isAtBottom, scrollToBottom }: ChatPanelProps) {
  const [aiState] = useAIState();
  const [messages, setMessages] = useUIState<typeof AI>();
  const { submitUserMessage } = useActions();
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false);
  const [messagesTemplate, setMessagesTemplate] = React.useState([]);
  const searchParams = useSearchParams()

  const prompt = searchParams.get('prompt')
  const agentId = searchParams.get('agentId')

  React.useEffect(() => {
    const getChatTemplate = async () => {
      const response = await axios.get(`/api/agent?agentId=${agentId}`);
      console.log('response', response.data.messenge_template)
      setMessagesTemplate(response.data.messenge_template)
    }

    if (agentId) {
      getChatTemplate()
    }
  }, [agentId])
  const exampleMessages: any[] = [
    {
      heading: 'What are the',
      subheading: 'trending memecoins today?',
      message: `What are the trending memecoins today?`
    },
    {
      heading: 'What is the price of',
      subheading: '$DOGE right now?',
      message: 'What is the price of $DOGE right now?'
    },
    {
      heading: 'I would like to buy',
      subheading: '42 $DOGE',
      message: `I would like to buy 42 $DOGE`
    },
    {
      heading: 'What are some',
      subheading: `recent events about $DOGE?`,
      message: `What are some recent events about $DOGE?`
    }
  ];
  React.useEffect(() => {
    const sendChat = async () => {
      setMessages(currentMessages => [
        ...currentMessages,
        {
          id: nanoid(),
          display: <UserMessage>{prompt}</UserMessage>
        }
      ]);

      const responseMessage = await submitUserMessage(prompt);

      setMessages(currentMessages => [...currentMessages, responseMessage]);
    }

    if (prompt) {
      sendChat()
    }
  }, [prompt])
  return (
    <div className="absolute inset-x-0 bottom-0 w-full  from-muted/30 from-0% to-muted/30 to-50% duration-300 ease-in-out animate-in dark:from-background/10 dark:from-10% dark:to-background/80 peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]">
      <ButtonScrollToBottom isAtBottom={isAtBottom} scrollToBottom={scrollToBottom} />

      {messages?.length >= 2 ? (
        id && title ? (
          <div className="flex h-12 items-center justify-center">
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShareDialogOpen(true)}>
                <IconShare className="mr-2" />
                Share
              </Button>
              <ChatShareDialog
                open={shareDialogOpen}
                onOpenChange={setShareDialogOpen}
                onCopy={() => setShareDialogOpen(false)}
                shareChat={shareChat}
                chat={{
                  id,
                  title,
                  messages: aiState.messages
                }}
              />
            </div>
          </div>
        ) : null
      ) : null}


      <div className="w-full p-10">
        <div className="gird-cols-2 grid shrink-0 gap-5 md:grid-cols-4 pb-5">
          {messagesTemplate && messages.length === 1 &&
            messagesTemplate.map((example: any, index) => (
              <div
                data-augmented-ui
                key={example.title}
                className={classNames(
                  'border-none outline-none',
                  'aug-tl1-2 aug-clip-tl',
                  'aug-border-bg-secondary aug-border aug-border-2 bg-[#2C3035] p-3',
                  'aug-round-r1 aug-round-bl1 aug-tr1-8 aug-br1-8 aug-bl1-8 p-4',
                  'flex cursor-pointer flex-col gap-2'
                )}
                onClick={async () => {
                  setMessages(currentMessages => [
                    ...currentMessages,
                    {
                      id: nanoid(),
                      display: <UserMessage>{example.content}</UserMessage>
                    }
                  ]);

                  const responseMessage = await submitUserMessage(example.content);

                  setMessages(currentMessages => [...currentMessages, responseMessage]);
                }}
              >
                <p className="text=[#6B7280]">{example.title}</p>
                <p className="text-[#9CA3AF]">{example.description}</p>
              </div>
            ))}
        </div>
        <PromptForm input={input} setInput={setInput} />
      </div>
    </div>
  );
}
