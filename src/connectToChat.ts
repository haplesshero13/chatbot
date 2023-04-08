import * as dotenv from 'dotenv';
import { RefreshingAuthProvider } from '@twurple/auth';
import { ChatClient, LogLevel } from '@twurple/chat';
import { ApiClient } from '@twurple/api';
import { intervalToDuration } from 'date-fns';
import { commands, shoutout, tryGetChannel } from './commands';
import { ShoutoutTimestamp } from './index';
import { connectToDatabase, getToken, updateToken } from './storage';

export async function connectToChat() {
  dotenv.config();

  const db = await connectToDatabase();

  const clientId = process.env.CLIENT_ID ?? '';
  const clientSecret = process.env.CLIENT_SECRET ?? '';
  const channels: string[] = JSON.parse(process.env.CHANNELS ?? '[]');
  const autoShoutoutUsers: string[] = JSON.parse(
    process.env.AUTO_SHOUTOUTS ?? '[]',
  );
  const tokenData = await getToken(db);
  if (tokenData == null) {
    return console.error('Token data not found!');
  }
  const authProvider = new RefreshingAuthProvider(
    {
      clientId,
      clientSecret,
      onRefresh: async (newTokenData) =>
        await updateToken(db, { _id: tokenData._id, ...newTokenData }),
    },
    tokenData,
  );
  const apiClient = new ApiClient({ authProvider });
  const chatClient = new ChatClient({
    authProvider,
    channels,
    logger: { minLevel: LogLevel.DEBUG },
  });
  await chatClient.connect();

  const autoShoutouts = autoShoutoutUsers.reduce<ShoutoutTimestamp>(
    (acc, user) => {
      return { ...acc, [user]: 0 };
    },
    {},
  );

  const shouldAutoShoutout = (user: string): boolean => {
    const timestamp = autoShoutouts[user];

    return (
      timestamp != null &&
      (intervalToDuration({ start: timestamp, end: new Date() }).days ?? 0) > 0
    );
  };

  chatClient.onJoin((channel) => {
    chatClient.say(channel, '/me has joined the chat! 🤖');
  });

  chatClient.onMessage(async (channel, user, message, msg) => {
    if (shouldAutoShoutout(user)) {
      const userToShout = await apiClient.users.getUserByName(user);

      if (userToShout != null) {
        chatClient.say(
          channel,
          shoutout(userToShout, await tryGetChannel(apiClient, userToShout)),
        );
        autoShoutouts[user] = new Date();
      }
    }

    try {
      await Promise.all(
        commands(apiClient, chatClient).map(async (command) => {
          if (command.pattern.test(message)) {
            await command.implementation(
              message.split(' '),
              message.match(command.pattern) ?? [],
            )(channel, user, message, msg);
          }
        }),
      );
    } catch (error) {
      console.error(error);
    }
  });
}
