const Discord = require('discord.js');
const client = new Discord.Client();
const globals = require('./globals')
const logger = globals.logger


client.on('ready', () => {
    logger.info(`Logged in as ${client.user.tag}!`);
    client.user.setActivity("currently being developed")
});

client.on('message', msg => {
    try {
        const commandHandler = require('./handlers/messageHandler');
        commandHandler.messageRecived(msg, client);
    } catch (error) {
        logger.error(error);
    }
})
console.log("globals.bot_token", globals.bot_token);
client.login(globals.bot_token);