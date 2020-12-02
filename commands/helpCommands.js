const ac = require('../helpers/actions')
const ch = require('../helpers/commadHelper')
const gh = require('../helpers/generalHelper')
var globals = null;
var logger = null;
setTimeout(() => {
    globals =  require('../globals');
    logger =  globals.logger;
}, 50);

var commands = [
    {command: 'help', 
    requireArgs: [0,1],
    description: 'Shows all commands, with description', 
    function: (args, msg) => {
        var embed = ac.embed(msg.channel,"Help Menu", "View more commands by passing a tag (example: .help mod)\nTags: "+globals.commandsItems.filter(x=> x.short !=='user' && x.short !== 'help').map(x=> "`" + x.short +"`").join(", ") + "\n", false, true)
            var commandsItemFilter = globals.commandsItems.filter(x=> (args.length === 0 ? 'user' : args[0].toLowerCase())  === x.short)
            if (commandsItemFilter.length != 0) {
                var commandItem = commandsItemFilter[0]
                commandItem.commands.forEach(command => {
                    embed.addField(`.${gh.capitalize(command.command)} ${command.args ? command.args.map(x=> gh.capitalize(x)).join(' '): ''}`, gh.capitalize(command.description))
                });

            }else {
                embed.addField("Error","There are no commands with that tag!")
            }
            msg.channel.send(embed);
    }}
]

module.exports =  {
    name: "Help",
    short: "help",
    commands: commands
}
