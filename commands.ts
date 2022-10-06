import { TwitchPrivateMessage } from '@twurple/chat/lib/commands/TwitchPrivateMessage';
import { formatDuration, intervalToDuration } from 'date-fns';
import { ChatClient } from '@twurple/chat';
import { ApiClient, HelixChannel, HelixUser } from '@twurple/api';

type CommandImpl = (
  args: string[],
) => (
  channel: string,
  user: string,
  message: string,
  msg: TwitchPrivateMessage,
) => Promise<void>;

type Command = {
  pattern: RegExp;
  implementation: CommandImpl;
};

const fetchSplatSchedule = (mode: string, args: string[]) => {
  return fetch(
    `http://schedule.splat.pw/splatoon3?q=${args[1]}&arg=${args[2]}&mode=${mode}`,
  ).then((response) => response.text());
};

export const shoutout = (user: HelixUser, channel: HelixChannel | null) => {
  return `Go check out ${user.displayName} at https://twitch.tv/${
    user.name
  } where they were last playing ${channel?.gameName || 'no game'}!`;
};

export const tryGetChannel = async (
  apiClient: ApiClient,
  userToShout: HelixUser,
) => {
  try {
    return apiClient.channels.getChannelInfoById(userToShout.id);
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const commands = (
  apiClient: ApiClient,
  chatClient: ChatClient,
): Command[] => [
  {
    pattern: /^!anarchy/,
    implementation: (args) => async (channel, user) => {
      const response = await fetchSplatSchedule('bankara', args);
      return chatClient.say(channel, `@${user} -> ${response}`);
    },
  },
  {
    pattern: /^!regular/,
    implementation: (args) => async (channel, user) => {
      const response = await fetchSplatSchedule('regular', args);
      return chatClient.say(channel, `@${user} -> ${response}`);
    },
  },
  {
    pattern: /^!ranked/,
    implementation: (args) => async (channel, user) => {
      const response = await fetchSplatSchedule('bankara', args);
      return chatClient.say(channel, `@${user} -> ${response}`);
    },
  },
  {
    pattern: /^!turf/,
    implementation: (args) => async (channel, user) => {
      const response = await fetchSplatSchedule('regular', args);
      return chatClient.say(channel, `@${user} -> ${response}`);
    },
  },
  {
    pattern: /^!x/,
    implementation: (args) => async (channel, user) => {
      const response = await fetchSplatSchedule('x', args);
      return chatClient.say(channel, `@${user} -> ${response}`);
    },
  },
  {
    pattern: /^!league/,
    implementation: (args) => async (channel, user) => {
      const response = await fetchSplatSchedule('league', args);
      return chatClient.say(channel, `@${user} -> ${response}`);
    },
  },
  {
    pattern: /^!so/,
    implementation: (args) => async (channel) => {
      const userToShout = await apiClient.users.getUserByName(args[1]);

      if (userToShout != null) {
        return chatClient.say(
          channel,
          shoutout(userToShout, await tryGetChannel(apiClient, userToShout)),
        );
      }
      return chatClient.say(channel, 'User not found!');
    },
  },
  {
    pattern: /^!followage/,
    implementation: (args) => async (channel, user, message, msg) => {
      const follower =
        args[1] != null ? await apiClient.users.getUserByName(args[1]) : null;
      const followerId = follower != null ? follower.id : msg.userInfo.userId;
      const follow = await apiClient.users.getFollowFromUserToBroadcaster(
        followerId,
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

        return chatClient.say(
          channel,
          `@${
            follower?.displayName ?? user
          } has been following for ${formatDuration(
            intervalToDuration({
              start: followStartTimestamp,
              end: currentTimestamp,
            }),
            { delimiter: ', ' },
          )}!`,
        );
      } else {
        return chatClient.say(
          channel,
          `@${user} is not following! smh my head`,
        );
      }
    },
  },
];
