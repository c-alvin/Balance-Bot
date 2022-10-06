require('dotenv/config');
const { REST, SlashCommandBuilder, Routes } = require('discord.js');

const commands = [
  new SlashCommandBuilder().setName('inhouse').setDescription('replies with inhouse notice'),
  new SlashCommandBuilder().setName('server').setDescription('Replies with server info!'),
  new SlashCommandBuilder().setName('user').setDescription('Replies with user info!')
]
  .map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

rest.put(Routes.applicationGuildCommands(process.env.clientId, process.env.guildId), { body: commands })
  /* eslint-disable no-console */
  .then(data => console.log(`Successfully registered ${data.length} application commands.`))
  .catch(console.error);
