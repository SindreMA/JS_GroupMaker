const commandHandler = require('./handlers/messageHandler');
const Discord = require('discord.js');
const client = new Discord.Client();
var log4js = require("log4js");
var logger = log4js.getLogger();
logger.level = "debug";
const gh = require('./handlers/groupMakerHandler')

const config = require('C:\\tools\\groupmaker.json')


client.on('ready', () => {
    logger.info(`Logged in as ${client.user.tag}!`);
    client.guilds.cache.map(x => {
        logger.info(`Connected to server ${x.name}!`);
    })
    gh.fetchOldMessage(client)
    //client.user.setActivity("currently under development")
});

client.on('messageReactionAdd', (reaction, user) => {
    if (user.id !== client.user.id && !user.bot) {
        logger.info("Reaction added")
        gh.handleAction("reaction", reaction, user, client)
    }
})
client.on('messageReactionRemove', (reaction, user) => {
    if (user.id !== client.user.id && !user.bot) {
        logger.info("Reaction added")
        gh.handleRemoveAction("reaction", reaction, user, client)
    }
})

client.on('message', msg => {
    try {
        commandHandler.messageRecived(msg, client);
    } catch (error) {
        logger.error(error);
    }
})

client.login(config.bot_token);