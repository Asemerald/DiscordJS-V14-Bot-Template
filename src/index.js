require('dotenv').config();
const fs = require('fs');
const DiscordBot = require('./client/DiscordBot');

fs.writeFileSync('./terminal.log', '', 'utf-8');
const client = new DiscordBot();

MuteManager = require('./client/MuteManager');
client.mute_manager = new MuteManager(client);
client.mute_manager.init();

module.exports = client;

client.connect();

process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);