import { TwitchPrivateMessage } from '@twurple/chat/lib/commands/TwitchPrivateMessage';
import { formatDuration, intervalToDuration } from 'date-fns';
import { ChatClient } from '@twurple/chat';
import { ApiClient } from '@twurple/api';

export const commands = (apiClient: ApiClient, chatClient: ChatClient) => [
  {
    pattern: /^!followage/,
    implementation: async (
      channel: string,
      user: string,
      message: string,
      msg: TwitchPrivateMessage,
    ) => {
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
