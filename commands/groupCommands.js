const ch = require('../helpers/commadHelper')
const genhelper = require('../helpers/generalHelper')
const ac = require('../helpers/actions')
const wowHelper = require('../helpers/wowHelper')
const sql = require('../helpers/sqlHelper')
const fs = require('fs')
var log4js = require("log4js");
var logger = log4js.getLogger();
logger.level = "debug";

const groupHandler = require('../handlers/groupMakerHandler')
const { group } = require('console')

var errorEvent = (error, channel) => {
    ac.embed(channel, `Something went wrong: ${error}`)
}

var commands = [{
            command: 'new_group',
            description: 'Create a new group item',
            function: (args, msg, settings) => {
                logger.info(`Starting new group progress for user ${msg.author.tag}`)
                var embed = ac.embed(msg.channel, "Creating new group...", `Continue the setup in direct messages ${msg.author}!`, null, true);
                msg.channel.send(embed).then(message => {
                    message.delete({ timeout: 5000 })
                    logger.debug(`Deleting group creation msg after 2 sec`)
                    groupHandler.createNewGroup(msg.author, msg.channel, 1)
                });

            }
        },
        {
            command: 'create_group',
            description: 'dungeon(slug) "Title" "description" "level" "tanks(number)" healers(number) dps(number)',
            function: (args, msg, settings) => {
                logger.info(`Starting new group progress for user ${msg.author.tag}`)
                const map = args[0]
                const title = args[1]
                const description = args[2]
                const level = args[3]
                const tanks = args[4]
                const healers = args[5]
                const dps = args[6]

                groupHandler.CreateGroupItem(1, tanks, healers, dps, description, map, msg, title, level)
            }
        },
        {
            command: 'maps',
            description: 'See what maps you can select',
            function: (args, msg, settings) => {
                    sql.getOptions([1]).then(x => {
                                const sortedOptions = x.sort((a, b) => a.order - b.order)
                                const mapsText = sortedOptions.map(c => `[${c.order}] ${c.option} (${c.option.split(" ").filter(v=> v.toLowerCase() !== "the").map(v=> v[0]).join('')})`)

                                const mapString = `${"```"}${mapsText.join("\n")}${"```"}`
                                ac.embed(msg.channel, "Maps:", `You can pass map by using the id, full name or the initials${mapString}`, null);

            })

        }
    },
]

module.exports = {
    name: "Group maker",
    short: "group",
    commands: commands
}