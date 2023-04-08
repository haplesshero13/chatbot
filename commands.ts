import { TwitchPrivateMessage } from '@twurple/chat/lib/commands/TwitchPrivateMessage';
import { formatDuration, intervalToDuration } from 'date-fns';
import { ChatClient } from '@twurple/chat';
import { ApiClient, HelixChannel, HelixUser } from '@twurple/api';

type CommandImpl = (
  args: string[],
  matches: string[],
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

const fetchSalmonSchedule = async (arg: string) => {
  const json: Record<string, any> = await fetch(
    'https://splatoon3.ink/data/schedules.json',
  ).then((response) => response.json());
  const now = json.data.coopGroupingSchedule.regularSchedules.nodes[0];

  const weaponsNow = now.setting.weapons.map((w: any) => w.name).join(', ');
  const mapNow = now.setting.coopStage.name;
  const endNow = new Date(now.endTime).toLocaleString('en-us', {
    dateStyle: 'short',
    timeStyle: 'long',
  });

  const next = json.data.coopGroupingSchedule.regularSchedules.nodes[1];
  const weaponsNext = next.setting.weapons.map((w: any) => w.name).join(', ');
  const mapNext = next.setting.coopStage.name;
  const startNext = new Date(next.startTime).toLocaleString();

  switch (arg) {
    case 'now':
      return `Current Salmon Run: ${weaponsNow} on ${mapNow} ending at ${endNow}.`;
    case 'next':
      return `Next Salmon Run: ${weaponsNext} on ${mapNext} starting at ${startNext}`;
    default:
      return `Unknown arg '${arg}'. Try 'now' or 'next'.`;
  }
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
    pattern: /^!anarchy\s*/,
    implementation: (args) => async (channel, user) => {
      const response = await fetchSplatSchedule('bankara', args);
      return chatClient.say(channel, `@${user} -> ${response}`);
    },
  },
  {
    pattern: /^!regular\s*/,
    implementation: (args) => async (channel, user) => {
      const response = await fetchSplatSchedule('regular', args);
      return chatClient.say(channel, `@${user} -> ${response}`);
    },
  },
  {
    pattern: /^!ranked\s*/,
    implementation: (args) => async (channel, user) => {
      const response = await fetchSplatSchedule('bankara', args);
      return chatClient.say(channel, `@${user} -> ${response}`);
    },
  },
  {
    pattern: /^!turf\s*/,
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
    pattern: /^!salmon (now|next)/,
    implementation: (args, matches) => async (channel, user) => {
      const response = await fetchSalmonSchedule(matches[1]);
      return chatClient.say(channel, `@${user} -> ${response}`);
    },
  },
  {
    pattern: /^!so\s*/,
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
    pattern: /^!followage\s*/,
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
