const ac = require('../helpers/actions')
const ch = require('../helpers/commadHelper')
const gh = require('../helpers/generalHelper')

var log4js = require("log4js");
var logger = log4js.getLogger();
logger.level = "debug";

const config = require('C:\\tools\\groupmaker.json')



function commands(commandItems) {
    return [{
        command: 'help',
        requireArgs: [0, 1],
        description: 'Shows all commands, with description',
        function: (args, msg) => {
            logger.debug(commandItems)
            const commandTags = commandItems && commandItems.length !== 0 ? commandItems.filter(x => x && x.short !== 'user' && x.short !== 'help').map(x => "`" + x.short + "`").join(", ") : ''
            var embed = ac.embed(msg.channel, "Help Menu", `View commands by passing a tag (example: ${config.prefix}help mod)\n`, false, true)
            var commandsItemFilter = commandItems.filter(x => (args.length === 0 ? 'user' : args[0].toLowerCase()) === x.short)
            if (args.length !== 0) {

                if (commandsItemFilter.length != 0) {
                    var commandItem = commandsItemFilter[0]
                    commandItem.commands.forEach(command => {
                        embed.addField(`${config.prefix}${gh.capitalize(command.command)} ${command.args ? command.args.map(x=> gh.capitalize(x)).join(' '): ''}`, gh.capitalize(command.description))
                    });

                } else {
                    embed.addField("Error", "There are no commands with that tag!")
                }
            } else {
                embed.addField("No tag added, here are the avalible: ", commandTags)
            }
            msg.channel.send(embed);
        }
    }]
}

module.exports = {
    name: "Help",
    short: "help",
    commands: commands
}