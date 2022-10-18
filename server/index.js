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
const team1 = [];
const team2 = [];
const waitlist = [];

client.on('ready', () => {
  /* eslint-disable no-console */
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', msg => {
  const player = users.length === 1
    ? 'player'
    : 'players';
  if (msg.content.toLowerCase() === 'teams') {
    if (users.length < 10) {
      msg.reply(`${users.length} ${player} in the queue! Get 10 players or else <:shank:565701996015910922>.`);
    } else {
      for (let i = 0; i < users.length; i++) {
        if (i <= 4) {
          team1.push(`<@${users[i]}>`);
        } else if (i <= 9) {
          team2.push(`<@${users[i]}>`);
        } else {
          waitlist.push(`<@${users[i]}>`);
        }
      }
      msg.reply(`Team <:yas:1031775988218089514>: ${team1}
Team <:ekk:1031775967343034368>: ${team2}
Waitlist: ${waitlist}`);
    }
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'inhouse') {
    users = [];
    const filter = (reaction, user) => {
      // return reaction.emoji.name;
      return reaction.emoji.name === 'DavidHeh';
    };

    const message = await interaction.reply({ content: 'React to sign-up for Inhouse', fetchReply: true });
    message.react('<:DavidHeh:1013223547889533038>');

    client.on('messageReactionAdd', (MessageReaction, User) => {
      if (MessageReaction.emoji.name !== 'DavidHeh') MessageReaction.remove();
    });

    const collector = message.createReactionCollector({ filter, dispose: true });

    collector.on('collect', (reaction, user) => {
      // console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
      users.push(user.id);
      if (users[0] === '1027410355007262773') {
        users.splice(0, 1);
      }

      if (users.length >= 10) {
        users = _.shuffle(users);
      }

    });

    collector.on('remove', (reaction, user) => {
      if (reaction.emoji.name === 'DavidHeh') {
        for (let i = 0; i < users.length; i++) {
          if (user.id === users[i]) {
            users.splice(i, 1);
          }
        }
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
