const { Client } = require('discord.js');
const { registerCommands, registerEvents } = require('./utils/registry');
const config = require('dotenv').config();
const client = new Client();

(async () => {
  client.commands = new Map();
  client.events = new Map();
  client.prefix = process.env.PREFIX;
  await registerCommands(client, '../commands');
  await registerEvents(client, '../events');
  await client.login(process.env.TOKEN);
  client.user.setActivity("!info");
})();

