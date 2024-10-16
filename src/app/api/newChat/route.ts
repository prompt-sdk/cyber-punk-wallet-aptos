import { MongoClient } from 'mongodb';
import { NextResponse, NextRequest } from 'next/server';
import { saveChat } from '@/libs/chat/chat.actions';
import { auth } from '@/modules/auth/constants/auth.config';
import { nanoid } from '@/modules/chat/utils/utils';
import { Session } from 'types/chat';
import { Chat, Message } from 'types/chat';

export const maxDuration = 300;
export async function POST(request: NextRequest) {
  try {
    const { agentId } = await request.json();
    const session: any = await auth();
    if (session && session.user) {
      const chatId = nanoid();
      const session: any = (await auth()) as Session;

      const createdAt = new Date();
      const userId = session.user.username as string;
      const path = `/chat/${chatId}`;
      const title = agentId;
      const messages: any[] = [];
      const chat: Chat = {
        id: chatId,
        agentId,
        title,
        userId,
        createdAt,
        messages,
        path
      };

      await saveChat(chat);
      return NextResponse.json({ chat_id: chatId });
    } else {
      return NextResponse.json({ error: 'cant create chat' }, { status: 500 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
