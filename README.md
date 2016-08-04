# playdate-yuki

A bot for the Reddit Playdate group chat on Steam.

## Installation

To run your own version of Yuki, you will need to have Node.js installed. Clone, or download and extract this repository. Navigate to the directory in terminal, and `npm install` to download dependencies.

You will also need to save a file named `.env` in the root directory, with at least a `USERNAME` and `PASSWORD` variable so that the bot can log on.

**When you first log in you will be prompted to enter a Steam Guard code.**

Also note that new accounts are usually limited. If you start a new account for your bot, you may have to add funds to its Steam Wallet before it will be allowed to enter group chats.

## Usage

Yuki's commands are single words prefixed with `!`.

- !compare _player_ to _player_: fetches owned games for two players in chat, and returns a list of five of the most played games that they have in common.
- !lookup _game_: fetches the game's Steam id and then returns a list of players in chat who own that game.
- !yuki _this_ or _that_?: randomly selects from a list of two or more options.

## Contributing

You are welcome to extend Yuki's functionality by adding commands or responses.
