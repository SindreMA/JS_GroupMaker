var log4js = require("log4js");
var logger = log4js.getLogger();
logger.level = "debug";
const helpCommands = require('./commands/helpCommands')
const modCommands = require('./commands/modCommands')
const wowCommands = require('./commands/wowCommands')
const userCommands = require('./commands/userCommands')
const settingsCommands = require('./commands/settingsCommands')

module.exports = {
    sql_login: {
        user: 'postgres',
        host: 'localhost',
        database: 'GroupMaker',
        password: 'LasjsKJAsgsg#2123wqe1',
        port: 5432,
    },
    bot_token: "You key here",
    logger: logger,
    commandsItems: [
        modCommands,
        helpCommands,
        wowCommands,
        userCommands,
        settingsCommands
    ]
};