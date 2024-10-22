import { MongoClient, ObjectId } from 'mongodb';
import { NextResponse, NextRequest } from 'next/server';

export const maxDuration = 300;

export async function GET(req: NextRequest) {
  try {
    if (req.nextUrl.searchParams.get('userId') || req.nextUrl.searchParams.get('user_id')) {
      const user_id = req.nextUrl.searchParams.get('userId') || req.nextUrl.searchParams.get('user_id') || '';
      let client = new MongoClient(process.env.MONGO_DB as string);
      let clientPromsie = await client.connect();
      let db = clientPromsie.db('prompt');
      let col = await db.collection('agent');

      const data = await col.find({ user_id: user_id }).toArray();

      return NextResponse.json(data);
    }
    if (req.nextUrl.searchParams.get('agentId') || req.nextUrl.searchParams.get('agent_id')) {
      const agent_id = req.nextUrl.searchParams.get('agentId') || req.nextUrl.searchParams.get('agent_id') || '';
      let client = new MongoClient(process.env.MONGO_DB as string);
      let clientPromsie = await client.connect();
      let db = clientPromsie.db('prompt');
      let col = await db.collection('agent');

      const data = await col.findOne({ _id: new ObjectId(agent_id) });

      return NextResponse.json(data);
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data: any = await req.json();
    console.log('data', data);
    let client = new MongoClient(process.env.MONGO_DB as string);
    let clientPromsie = await client.connect();
    let db = clientPromsie.db('prompt');
    let col = await db.collection('agent');
    const updata = await col.updateOne(data, { $set: { user_id: data.user_id } }, { upsert: true });

    return NextResponse.json(updata);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data: any = await req.json();
    const _id = data._id; // Assuming _id is provided in the request body
    delete data._id; // Remove _id from data before updating
    let client = new MongoClient(process.env.MONGO_DB as string);
    let clientPromsie = await client.connect();
    let db = clientPromsie.db('prompt');
    let col = await db.collection('agent');
    console.log('data', data);
    console.log('_id', _id);
    // Update the document with the provided _id
    const updateResult = await col.updateOne({ _id: new ObjectId(_id) }, { $set: data }, { upsert: false });

    return NextResponse.json(updateResult);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
