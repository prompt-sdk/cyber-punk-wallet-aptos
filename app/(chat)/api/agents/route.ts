import { NextRequest, NextResponse } from 'next/server';
import { getAgentByUserId, createAgent } from '@/db/queries';
import { Agent } from '@/db/schema';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId: any = searchParams.get('userId');
  try {
    const agents = await getAgentByUserId(userId);

    return NextResponse.json(agents);
  } catch (error) {
    console.error('Error fetching agent:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const agentData: Agent = await request.json();

    const requiredFields = ['name', 'description', 'userId'];
    for (const field of requiredFields) {
      if (!agentData[field as keyof Agent]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }
    console.log(agentData);
    const result = await createAgent(agentData);

    return NextResponse.json({
      message: 'Agent created successfully',
      agent: result,
    });
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
