import { MongoClient } from 'mongodb';

// /api/new-meetup
// POST /api/new-meetup
/** This function will run on the server and not the client */
async function handler(req, res) {
  if (req.method === 'POST') {
    const data = req.body; // body/data of the incoming request

    const client = await MongoClient.connect(
      'mongodb+srv://root:root@cluster0.f2dq0.mongodb.net/meetups?retryWrites=true&w=majority'
    );
    const db = client.db();
    const meetupsCollection = db.collection('meetups');
    const result = await meetupsCollection.insertOne(data);
    console.log(result);

    client.close();

    res.status(201).json({ message: 'Meetup inserted!' });
  }
}

export default handler;