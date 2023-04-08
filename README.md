# Chat Bot

A flexible Twitch chatbot

## Setup

This chatbot requires mongodb to store an oauth token, which can be installed through docker or through their installer.

### ENV Setup

Copy `.example.env` to `.env`. Update the variables to the channels you wish to use, and
create a new app in the [Twitch dev console](https://dev.twitch.tv/console/apps) (2FA is required)
using the user who will be acting as the bot. This can be your broadcast channel, or another
dedicated user.

```bash
CHANNELS='["haplesshero"]'
CLIENT_ID="<obtain from https://dev.twitch.tv/console/apps>"
CLIENT_SECRET="<obtain from https://dev.twitch.tv/console/apps>"
DB_CONNECTION="mongodb+srv://user:password@localhost/"
DB_NAME="chatbot"
```

### Running with Node

Requires Node v18.

```bash
yarn install
yarn start
```

## Built-in Commands
- Auto-shoutout
  - Rename `autoshoutout-example.json` to `src/autoshoutout.json` and edit the array of users
- `!followage` tells you how long you've been following
- `!anarchy`, `!x`, `!league`, `!regular` gives access to the splatoon3.ink map/mode rotation info

## Roadmap
- Automated messages (timers)
- Add custom command command (e.g. addcomm) with simple JS evaluation
- Add server and a frontend to allow admin to add new channels
