import * as dotenv from 'dotenv';
import express from 'express';
import { connectToChat } from './connectToChat';

dotenv.config();

const port = process.env.PORT || 3000;
const app = express();

export type ShoutoutTimestamp = {
  [user: string]: number | Date;
};

connectToChat();

app.get('/', (req, res) => {
  res.send('OK');
});

app.listen(port, () => {
  console.log(`[server]: Server is running at https://localhost:${port}`);
});
