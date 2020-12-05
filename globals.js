const helpCommands = require('./commands/helpCommands')
const modCommands = require('./commands/modCommands')
const wowCommands = require('./commands/wowCommands')
const userCommands = require('./commands/userCommands')
const settingsCommands = require('./commands/settingsCommands')

module.exports = {
    commandsItems: [
        modCommands,
        helpCommands,
        wowCommands,
        userCommands,
        settingsCommands
    ]
};