require('dotenv/config');
const express = require('express');
const staticMiddleware = require('./static-middleware');
const errorMiddleware = require('./error-middleware');
const { Client, GatewayIntentBits } = require('discord.js');
const _ = require('lodash');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions
  ]
});

let users = [];

client.on('ready', () => {
  /* eslint-disable no-console */
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', msg => {
  const player = users.length === 1
    ? 'player'
    : 'players';
  if (msg.content === 'teams') {
    if (users.length !== 10) {
      msg.reply(`${users.length} ${player} in the queue! Get 10 players or else <:shank:565701996015910922>.`);
    } else {
      msg.reply(`team 1: ${users}`);
    }
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'inhouse') {
    users = [];
    const filter = (reaction, user) => {
      return reaction.emoji.name === 'DavidHeh';
    };

    const message = await interaction.reply({ content: 'Sign up for inhouse', fetchReply: true });
    message.react('<:DavidHeh:1013223547889533038>');

    const collector = message.createReactionCollector({ filter });

    collector.on('collect', (reaction, user) => {
      // console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
      users.push(user.tag);
      if (users[0] === 'Balance Bot#0880') {
        users.splice(0, 1);
      }

      if (users.length === 10) {
        users = _.shuffle(users);
      }

    });

  }
});

client.login(process.env.TOKEN);

const app = express();

app.use(staticMiddleware);

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  process.stdout.write(`\n\napp listening on port ${process.env.PORT}\n\n`);
});
