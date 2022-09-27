import { TwitchPrivateMessage } from '@twurple/chat/lib/commands/TwitchPrivateMessage';
import { formatDuration, intervalToDuration } from 'date-fns';
import { ChatClient } from '@twurple/chat';
import { ApiClient } from '@twurple/api';

type CommandImpl = (
  args: string[],
) => (
  channel: string,
  user: string,
  message: string,
  msg: TwitchPrivateMessage,
) => Promise<void>;

export type Command = {
  pattern: RegExp;
  implementation: CommandImpl;
};

const fetchSplatSchedule = (mode: string, args: string[]) => {
  return fetch(
    `http://schedule.splat.pw/splatoon3?q=${args[1]}&arg=${args[2]}&mode=${mode}`,
  ).then((response) => response.text());
};

export const commands = (
  apiClient: ApiClient,
  chatClient: ChatClient,
): Command[] => [
  {
    pattern: /^!anarchy/,
    implementation: (args) => async (channel, user) => {
      const response = await fetchSplatSchedule('bankara', args);
      chatClient.say(channel, `@${user} -> ${response}`);
    },
  },
  {
    pattern: /^!regular/,
    implementation: (args) => async (channel, user) => {
      const response = await fetchSplatSchedule('regular', args);
      chatClient.say(channel, `@${user} -> ${response}`);
    },
  },
  {
    pattern: /^!ranked/,
    implementation: (args) => async (channel, user) => {
      const response = await fetchSplatSchedule('bankara', args);
      chatClient.say(channel, `@${user} -> ${response}`);
    },
  },
  {
    pattern: /^!turf/,
    implementation: (args) => async (channel, user) => {
      const response = await fetchSplatSchedule('regular', args);
      chatClient.say(channel, `@${user} -> ${response}`);
    },
  },
  {
    pattern: /^!x/,
    implementation: (args) => async (channel, user) => {
      const response = await fetchSplatSchedule('x', args);
      chatClient.say(channel, `@${user} -> ${response}`);
    },
  },
  {
    pattern: /^!league/,
    implementation: (args) => async (channel, user) => {
      const response = await fetchSplatSchedule('league', args);
      chatClient.say(channel, `@${user} -> ${response}`);
    },
  },
  {
    pattern: /^!followage/,
    implementation: () => async (channel, user, message, msg) => {
      const follow = await apiClient.users.getFollowFromUserToBroadcaster(
        msg.userInfo.userId,
        msg.channelId ?? '',
      );

      if (follow) {
        const currentTimestamp = new Date();
        const followStartTimestamp = follow.followDate;

        console.log(
          JSON.stringify({
            start: followStartTimestamp,
            end: currentTimestamp,
          }),
        );

        chatClient.say(
          channel,
          `@${user} You have been following for ${formatDuration(
            intervalToDuration({
              start: followStartTimestamp,
              end: currentTimestamp,
            }),
            { delimiter: ', ' },
          )}!`,
        );
      } else {
        chatClient.say(channel, `@${user} You are not following! smh my head`);
      }
    },
  },
];
