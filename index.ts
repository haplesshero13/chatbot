import { RefreshingAuthProvider } from '@twurple/auth';
import { ChatClient, LogLevel } from '@twurple/chat';
import { ApiClient } from '@twurple/api';
import { intervalToDuration } from 'date-fns';
import { readFile, writeFile } from 'node:fs/promises';
import * as dotenv from 'dotenv';
import { commands, shoutout, tryGetChannel } from './commands';
import autoShoutoutUsers from './autoshoutout.json';

dotenv.config();

type ShoutoutTimestamp = {
  [user: string]: number | Date;
};

async function main() {
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

  const clientId = process.env.CLIENT_ID ?? '';
  const clientSecret = process.env.CLIENT_SECRET ?? '';
  const channels = JSON.parse(process.env.CHANNELS ?? '[]');
  const tokenData = JSON.parse(await readFile('./tokens.json', 'utf8'));
  const authProvider = new RefreshingAuthProvider(
    {
      clientId,
      clientSecret,
      onRefresh: async (newTokenData) =>
        await writeFile(
          './tokens.json',
          JSON.stringify(newTokenData, null, 4),
          'utf8',
        ),
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
            await command.implementation(message.split(' '))(
              channel,
              user,
              message,
              msg,
            );
          }
        }),
      );
    } catch (error) {
      console.error(error);
    }
  });
}

main();
