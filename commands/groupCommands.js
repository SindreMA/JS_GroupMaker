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
        description: 'dungeon(slug) "description" "tanks(number)" healers(number) dps(number)',
        function: (args, msg, settings) => {
            logger.info(`Starting new group progress for user ${msg.author.tag}`)
            var embed = ac.embed(msg.channel, "Making group...", "", null, true);
            msg.channel.send(embed).then(message => {
                groupHandler.CreateGroupItem(1, maxtanks, maxhealers, maxdamagers, description, map, msg)
            });

        }
    }
]

module.exports = {
    name: "Group maker",
    short: "group",
    commands: commands
}