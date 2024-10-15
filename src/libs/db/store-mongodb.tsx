import { MongoClient } from 'mongodb';
export const getTools = async (user_id: string) => {
    let client = new MongoClient(process.env.MONGO_DB as string);
    let clientPromsie = await client.connect();
    let db = clientPromsie.db('prompt');
    let col = await db.collection('tools');
    const data = await col.find({ user_id: user_id }).toArray();
    return data;
};