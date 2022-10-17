require('dotenv/config');
const express = require('express');
const staticMiddleware = require('./static-middleware');
const errorMiddleware = require('./error-middleware');
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions
  ]
});

const users = [];

client.on('ready', () => {
  /* eslint-disable no-console */
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', msg => {
  if (msg.content === 'ping') {
    msg.reply('pong');
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'inhouse') {

    const filter = (reaction, user) => {
      return reaction.emoji.name === 'DavidHeh';
    };

    const message = await interaction.reply({ content: 'Sign up for inhouse', fetchReply: true });
    message.react('<:DavidHeh:1013223547889533038>');

    const collector = message.createReactionCollector({ filter });

    collector.on('collect', (reaction, user) => {
      // console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
      users.push(user.tag);
      console.log(users);
      console.log(collector.message.reactions);
    });

  }
});

client.login(process.env.TOKEN);

const app = express();

app.use(staticMiddleware);

app.get('/api/hello', (req, res) => {
  res.json({ hello: 'world' });
});

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  process.stdout.write(`\n\napp listening on port ${process.env.PORT}\n\n`);
});
