const Discord = require('discord.js');
const client = new Discord.Client();
const commandHandler = require('./handlers/messageHandler');
const globals = require('./globals')
const logger = globals


client.on('ready', () => {
    logger.info(`Logged in as ${client.user.tag}!`);
    client.user.setActivity("currently being developed")
});

client.on('message', msg => {
    try {
        commandHandler.messageRecived(msg, client);
    } catch (error) {
        logger.error(error);
    }
})

client.login(globals.bot_token);