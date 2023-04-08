# Chat Bot

A flexible Twitch chatbot

## Setup

For now, the chat bot only runs locally because the OAuth token is saved locally in a file.

### ENV Setup

Copy `.example.env` to `.env`. Update the variables to the channels you wish to use, and
create a new app in the [Twitch dev console](https://dev.twitch.tv/console/apps) (2FA is required)
using the user who will be acting as the bot. This can be your broadcast channel, or another
dedicated user.

```bash
CHANNELS='["haplesshero"]'
CLIENT_ID="<obtain from https://dev.twitch.tv/console/apps>"
CLIENT_SECRET="<obtain from https://dev.twitch.tv/console/apps>"
```

### Running with Node

Requires Node v18.

```bash
yarn install
yarn start
```

## Built-in Commands
- Auto-shoutout
  - Rename `autoshoutout-example.json` to `autoshoutout.json` and edit the array of users
- `!followage` tells you how long you've been following
- `!anarchy`, `!x`, `!league`, `!regular` gives access to the splatoon3.ink map/mode rotation info

## Roadmap
- Move persistence (tokens) from filesystem to database to support cloud deployment
- Add custom command command (e.g. addcomm) with simple JS evaluation
- Add Express server and a frontend to allow admin (me or someone) to add new channels
