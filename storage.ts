import * as mongoDB from 'mongodb';
import * as dotenv from 'dotenv';
import { AccessToken } from '@twurple/auth/lib';

export type AccessTokenDoc = mongoDB.WithId<mongoDB.Document> & AccessToken;

export async function connectToDatabase() {
  dotenv.config();

  const client: mongoDB.MongoClient = new mongoDB.MongoClient(
    process.env.DB_CONNECTION ?? '',
  );

  await client.connect();

  const db: mongoDB.Db = client.db(process.env.DB_NAME);

  console.log(`Successfully connected to database: ${db.databaseName}`);

  return db;
}

export async function getToken(db: mongoDB.Db): Promise<AccessTokenDoc | null> {
  const tokensCollection = db.collection('tokens');

  return (await tokensCollection.findOne()) as AccessTokenDoc;
}

export async function updateToken(db: mongoDB.Db, token: AccessTokenDoc) {
  const tokensCollection = db.collection('tokens');

  return tokensCollection.replaceOne({ _id: token._id }, token);
}
