import { Message } from 'types/chat';
import { AI } from '@/libs/chat/ai.actions';
import { getMissingKeys } from '@/libs/chat/chat.actions';
import { creatAgentWithTool, getAgentById, getWidgetByID } from '@/libs/db/store-mongodb';

import { auth } from '@/modules/auth/constants/auth.config';
import { Chat } from '@/modules/chat/components/chat-ui';
import { nanoid } from '@/modules/chat/utils/utils';

export const metadata = {
  title: 'Prompt Wallet'
};

export interface IChatPageProps {
  // eslint-disable-next-line @typescript-eslint/ban-types
  params: {};
  searchParams: {
    agentId: string;
    prompt: string;
    widgetId: string;
  };
}

export default async function ChatPage({ searchParams }: IChatPageProps) {
  const session = await auth();

  if (searchParams.agentId) {
    const id = nanoid();
    const missingKeys = await getMissingKeys();
    const agent = await getAgentById(searchParams.agentId);

    const introMessenge: Message = {
      id: nanoid(),
      role: 'assistant',
      content: agent?.introMessage || 'Hello! How can I assist you today?'
    };

    return (
      <AI initialAIState={{ chatId: id, messages: [introMessenge], agentId: searchParams.agentId }}>
        <Chat id={id} session={session} missingKeys={missingKeys} />
      </AI>
    );
  }
  if (searchParams.widgetId) {
    const missingKeys = await getMissingKeys();
    const widget = await getWidgetByID(searchParams.widgetId);
    const id = nanoid();
    // create agent with tool
    const data: any = {
      name: 'Smart Action',
      prompt: ` You are a Helpful developer.\n 
            Analyze each query to determine if it requires plain text information or an action via a tool. Do not ever send tool call arguments with your chat. You must specifically call the tool with the information\n
            For informational queries like "create label show balance of 0x123123123", respond with text, then balance of account you answered with using the 'getBlanace'. Always say something before or after tool usage.\n
            Provide a response clearly and concisely. Always be polite, informative, and efficient.`,
      introMessage: 'Im Aptos Bot',
      widget: [],
      user_id: session?.user.username || '',
      tool_ids: widget?.tool.tool_ids,
      description: 'This bot will excute transaction'
    };
    const agentId = await creatAgentWithTool(data);

    return (
      <AI initialAIState={{ chatId: id, messages: [], agentId: agentId?.toString() }}>
        <Chat id={id} session={session} missingKeys={missingKeys} />
      </AI>
    );
  }
}
