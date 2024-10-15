import { MongoClient, ObjectId } from 'mongodb';
export const getTools = async (tool_ids: any[]) => {
    let client = new MongoClient(process.env.MONGO_DB as string);
    let clientPromsie = await client.connect();
    let db = clientPromsie.db('prompt');
    let col = await db.collection('tools');
    let oids: any[] = [];
    tool_ids.forEach(function (item) {
        oids.push(new ObjectId(item));
    });
    const data = await col.find({ _id: { "$in": oids } }).toArray();
    return data;
};
export const getToolIdByAgent = async (agentId: string) => {
    let client = new MongoClient(process.env.MONGO_DB as string);
    let clientPromsie = await client.connect();
    let db = clientPromsie.db('prompt');
    let col = await db.collection('agent');

    const data = await col.find({ _id: new ObjectId(agentId) }).toArray();
    return data;
};