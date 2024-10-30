import { CoreMessage } from 'ai';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import { Chat as PreviewChat } from '@/components/custom/chat';
import { getAgentById, getChatById, getTools } from '@/db/queries';
import { Chat, user } from '@/db/schema';
import { DEFAULT_MODEL_NAME, models } from '@/lib/model';
import { convertToUIMessages } from '@/lib/utils';
import { Agent } from 'http';

export default async function Page(props: { params: Promise<any> }) {
  const params = await props.params;
  const { id } = params;
  const chatFromDb = await getChatById({ id });
  const agentFromDb = await getAgentById(chatFromDb.agentId)
  if (!chatFromDb && !agentFromDb) {
    notFound();
  }
  // get agent Id from chat . chatFromDb.agent.ID

  const chat: Chat = {
    ...chatFromDb,
    messages: convertToUIMessages(chatFromDb.messages as Array<CoreMessage>),
  };

  const session: any = await auth();
  if (!session || !session.user) {
    return notFound();
  }

  if (session.user.id !== chat.userId) {
    return notFound();
  }
  const cookieStore = await cookies();
  const value = cookieStore.get('model')?.value;
  const selectedModelName =
    models.find((m) => m.name === value)?.name || DEFAULT_MODEL_NAME;
  const tools = await getTools(agentFromDb.tool as any);

  return (
    <PreviewChat
      prompt=''
      id={chat.id}
      username={session.user?.username}
      initialMessages={chat.messages}
      selectedModelName={selectedModelName}
      agent={agentFromDb}
      tools={tools}
    />
  );
}
