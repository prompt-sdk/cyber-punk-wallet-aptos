'use client';

import { Attachment, Message } from 'ai';
import { useChat } from 'ai/react';
import { useState } from 'react';

import { ChatHeader } from '@/components/custom/chat-header';
import { Message as PreviewMessage } from '@/components/custom/message';
import { useScrollToBottom } from '@/components/custom/use-scroll-to-bottom';
import { Model } from '@/lib/model';
import { Agent, Tool } from '@/db/schema';

import { MultimodalInput } from './multimodal-input';
import { Overview } from './overview';

export function Chat({
  id,
  initialMessages,
  selectedModelName,
  agent,
  tools,
  prompt,
  username
}: {
  id: string;
  initialMessages: Array<Message>;
  selectedModelName: Model['name'];
  agent: Agent;
  tools: Tool[];
  prompt: string;
  username: string;
}) {
  const { messages, handleSubmit, input, setInput, append, isLoading, stop } =
    useChat({
      body: { id, model: selectedModelName, agent, tools },
      initialMessages,
      onFinish: () => {
        window.history.replaceState({}, '', `/chat/${id}`);
      },
    });


  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  return (
    <div className="flex flex-col min-w-0 h-dvh bg-background">
      <ChatHeader selectedModelName={selectedModelName} />
      <div
        ref={messagesContainerRef}
        className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll scrollbar"
      >
        {messages.length === 0 && <Overview intro={agent?.intro || "GM"} />}

        {messages.map((message) => (
          <PreviewMessage
            username={username}
            sender={agent.name}
            key={message.id}
            role={message.role}
            content={message.content}
            attachments={message.experimental_attachments}
            toolInvocations={message.toolInvocations}
          />
        ))}

        <div
          ref={messagesEndRef}
          className="shrink-0 min-w-[24px] min-h-[24px]"
        />
      </div>
      <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
        <MultimodalInput
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          stop={stop}
          attachments={attachments}
          setAttachments={setAttachments}
          messages={messages}
          suggestedActions={agent.suggestedActions as any}
          startPrompt={prompt}
          append={append}
        />
      </form>
    </div>
  );
}
