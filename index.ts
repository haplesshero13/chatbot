import { RefreshingAuthProvider } from '@twurple/auth';
import { ChatClient, LogLevel } from '@twurple/chat';
import { readFile, writeFile } from 'node:fs/promises';
import * as dotenv from 'dotenv'

dotenv.config()

async function main() {
	const clientId = process.env.CLIENT_ID ?? '';
	const clientSecret = process.env.CLIENT_SECRET ?? '';
	const tokenData = JSON.parse(await readFile('./tokens.json', 'utf8'));
	const authProvider = new RefreshingAuthProvider(
		{
			clientId,
			clientSecret,
			onRefresh: async newTokenData => await writeFile('./tokens.json', JSON.stringify(newTokenData, null, 4), 'utf8')
		},
		tokenData
	);

  const channels = ['haplesshero'];
	const chatClient = new ChatClient({ authProvider, channels, logger: {minLevel: LogLevel.DEBUG} });
	await chatClient.connect();

  chatClient.onJoin(channel => {
    chatClient.say(channel, '/me has joined the chat!')
  });

	chatClient.onMessage((channel, user, message) => {
		if (message === '!ping') {
			chatClient.say(channel, 'Pong!');
		} else if (message === '!dice') {
			const diceRoll = Math.floor(Math.random() * 6) + 1;
			chatClient.say(channel, `@${user} rolled a ${diceRoll}`)
		}
	});

	chatClient.onSub((channel, user) => {
		chatClient.say(channel, `Thanks to @${user} for subscribing to the channel!`);
	});
	chatClient.onResub((channel, user, subInfo) => {
		chatClient.say(channel, `Thanks to @${user} for subscribing to the channel for a total of ${subInfo.months} months!`);
	});
	chatClient.onSubGift((channel, user, subInfo) => {
		chatClient.say(channel, `Thanks to ${subInfo.gifter} for gifting a subscription to ${user}!`);
	});
}

main();
