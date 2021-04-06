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
            description: '"Title" "description" "level" [dungeon(slug) "tanks(number)" healers(number) dps(number)]',
            requireArgs: [3, 4, 7],
            function: (args, msg, settings) => {
                logger.info(`Starting new group progress for user ${msg.author.tag}`)
                const title = args[0]
                const description = args[1]
                const level = args[2]

                const map = !args[3] || args[3].toLowerCase() === 'any' ? undefined : args[3]
                const tanks = args[4] ? args[4] : 1
                const healers = args[5] ? args[5] : 1
                const dps = args[6] ? args[6] : 3

                groupHandler.CreateGroupItem(1, tanks, healers, dps, description, map, msg, title, level)
            }
        },
        {
            command: 'cancel',
            description: 'Stop last event started by you, send with msg id to do spesific',
            function: (args, msg, settings, client) => {
                logger.info(`Canceling last event for ${msg.author.tag}`)
                const msgId = args[0]

                groupHandler.CancelGroupItem(msg, msgId, client)
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