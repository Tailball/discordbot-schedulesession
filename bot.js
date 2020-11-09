//Setup dotENV
require('dotenv').config();


//Set up Bot
const Discord = require('discord.js');
const client = new Discord.Client();

const parse = require('./botparser');
const log = require('./botlogger');


//Set up MongoDB
require('./database/databaseSetup');


//Set up Bot events
client.on('ready', () => {
    console.log(`Logged in on Discordbot as ${client.user.tag}!`);
});

client.on('message', msg => {
    log(msg);
    parse(msg);
});


//Activate bot
client.login(process.env.BOT_TOKEN);