require('dotenv/config');
const express = require('express');
const staticMiddleware = require('./static-middleware');
const errorMiddleware = require('./error-middleware');
const { Client, Events, GatewayIntentBits } = require('discord.js');
const _ = require('lodash');
const pg = require('pg');

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

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
const team1 = ['Noni'];
const team2 = ['Divine'];
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
          team1.push(users[i]);
        } else if (i <= 9) {
          team2.push(users[i]);
        } else {
          waitlist.push(users[i]);
          // `<@${users[i]}>`
        }
      }
      msg.reply(`Team <:yas:1031775988218089514>: ${team1}
Team <:ekk:1031775967343034368>: ${team2}
Waitlist: ${waitlist}`);
    }
  }
});

client.on('messageCreate', msg => {
  if (msg.content === 'team1win') {
    const sql = `
      UPDATE "Players"
      SET "Wins" = "Wins" + 1,
          "mmr" = "mmr" + 10
      WHERE "username" = $1 OR "username" = $2 OR "username" = $3 OR "username" = $4 OR "username" = $5
  `;

    const params = [team1[0], team1[1], team1[2], team1[3], team1[4]];
    db.query(sql, params);
    const sql2 = `
      UPDATE "Players"
      SET "Losses" = "Losses" + 1,
          "mmr" = "mmr" - 10
      WHERE "username" = $1 OR "username" = $2 OR "username" = $3 OR "username" = $4 OR "username" = $5
  `;

    const params2 = [team2[0], team2[1], team2[2], team2[3], team2[4]];
    db.query(sql2, params2);
    msg.reply('Match has been recorded');
  } else {
    if (msg.content === 'team2win') {
      const sql = `
      UPDATE "Players"
      SET "Wins" = "Wins" + 1,
          "mmr" = "mmr" + 10
      WHERE "username" = $1 OR "username" = $2 OR "username" = $3 OR "username" = $4 OR "username" = $5
  `;

      const params = [team2[0], team2[1], team2[2], team2[3], team2[4]];
      db.query(sql, params);
      const sql2 = `
      UPDATE "Players"
      SET "Losses" = "Losses" + 1,
          "mmr" = "mmr" - 10
      WHERE "username" = $1 OR "username" = $2 OR "username" = $3 OR "username" = $4 OR "username" = $5
  `;

      const params2 = [team1[0], team1[1], team1[2], team1[3], team1[4]];
      db.query(sql2, params2);
      msg.reply('Match has been recorded');
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

      users.push(user.username);
      if (users[0] === 'Balance Bot') {
        users.splice(0, 1);
      }

      console.log(users);
      if (users.length >= 10) {
        users = _.shuffle(users);
      }

      const sql = `
      insert into "Players" ("username", "Wins", "Losses", "mmr")
      values ($1, $2, $3, $4)
      ON CONFLICT DO NOTHING
      `;

      const params = [user.username, 0, 0, 1500];
      db.query(sql, params);

    });

    collector.on('remove', (reaction, user) => {
      if (reaction.emoji.name === 'DavidHeh') {
        for (let i = 0; i < users.length; i++) {
          if (user.username === users[i]) {
            users.splice(i, 1);
          }
        }
      }
    });
  }
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'ranking') {
    const sql = `
      select *
        from "Players"
        order by "mmr" DESC
      `;

    db.query(sql)
      .then(results => {
        const userRankings = JSON.stringify(results.rows);
        interaction.reply(userRankings);
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
