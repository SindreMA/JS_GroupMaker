const ch = require('../helpers/commadHelper')
const ac = require('../helpers/actions')
var log4js = require("log4js");
var logger = log4js.getLogger();
logger.level = "debug";
const sql = require('../helpers/sqlHelper')
const genhelper = require('../helpers/generalHelper')
const wowHelper = require('../helpers/wowHelper')

var errorEvent = (error, channel) => {
    ac.embed(channel, `Something went wrong: ${error}`)
}

var commands = [{
        command: 'add',
        args: ['name', 'realm', 'region'],
        requiredArgs: [2, 3],
        description: 'Adds the character to the watch list',
        selfserviceSupport: true,
        requirePermission: ['ADMINISTRATOR', 'management_role'],
        function: (args, msg, settings) => {
            var name = sql.cleanText(args[0])
            var realm = genhelper.string_to_slug(args[1])
            var region = genhelper.string_to_slug(args[2]);

            if (msg.member.roles.cache.filter(v => v.id === settings.management_role).length !== 0 || settings.self_service) {
                sql.getPlayers(msg.guild.id, msg.author.id, x => {
                    if (x.filter(c => c.name.toLowerCase() === name && c.realm.toLowerCase() === realm && c.region === region).length === 0) {
                        wowHelper.GetPlayerDetails(name, realm, region, true).then(x => {
                            sql.addPlayer(msg.guild.id, { name, realm, region, added_by: msg.author.id, }, c => {
                                var embed = ac.embed(msg.channel, `${x.data.name} have been added!`, null, null, true)
                                embed.setThumbnail(x.data.avatar_url)
                                    //embed.addField("Achievement Points", x.data.achievement_points, true)
                                embed.addField("Faction", x.data.faction, true)
                                embed.addField("Item Level", x.data.equipped_item_level, true)
                                embed.addField("Level", x.data.level, true)
                                msg.channel.send(embed);
                            }, er => errorEvent(er, msg.channel))
                        }).catch(x => ac.embed(msg.channel, "Can't find character!"))
                    } else {
                        ac.embed(msg.channel, "Player already exist!")
                    }
                }, er => errorEvent(er, msg.channel))
            } else {
                ac.embed(msg.channel, "You do not have permission to add players.")
            }
        }
    },
    {
        command: 'remove',
        args: ['name', 'realm', 'region'],
        requiredArgs: [2, 3],
        description: 'Removes the character from the watch list',
        selfserviceSupport: true,
        requirePermission: ['ADMINISTRATOR', 'management_role'],
        function: (args, msg, settings) => {
            var name = sql.cleanText(args[0])
            var realm = genhelper.string_to_slug(args[1])
            var region = genhelper.string_to_slug(args[2]);

            sql.getPlayers(msg.guild.id, x => {
                var ls = x.filter(c => name === c.name.toLowerCase() && realm === c.realm.toLowerCase() && region === c.region.toLowerCase())
                if (ls.length !== 0) {
                    var success = () => {
                        ac.embed(msg.channel, "Player have now been removed!")
                    }
                    if (msg.member.roles.cache.filter(v => v.id === settings.management_role).length !== 0) {
                        sql.removePlayer(msg.guild.id, { name, realm, region, admin: true }, success, (x) => errorEvent(x, msg.channel))
                    } else if (x.filter(c => c.added_by === msg.author.id).length !== 0) {
                        sql.removePlayer(msg.guild.id, { name, realm, region, user: msg.author.id }, success, (x) => errorEvent(x, msg.channel))
                    } else {
                        ac.embed(msg.channel, "You do not have permission to remove the player.")
                    }
                } else {
                    ac.embed(msg.channel, "There is no player with that name,realm and region");
                }
            }, er => errorEvent(er, msg.channel))
        }
    },
    {
        command: 'show',
        args: ['(all)'],
        requiredArgs: [0, 1],
        description: 'Show the characters added by that user',
        requirePermission: ['ADMINISTRATOR', 'management_role'],
        selfserviceSupport: true,
        function: (args, msg, settings, client) => {
            var showAll = args.length != 0 && args[0] === 'all'

            if (showAll) {
                if (msg.member.roles.cache.filter(v => v.id === settings.management_role).length !== 0) {
                    sql.getPlayers(msg.guild.id, null, x => {
                        ch.pagenatorList(x.map(x => `(${x.region.toUpperCase()}) ${ac.capitalizeFirstLetter(x.name)}-${ac.capitalizeFirstLetter(x.realm)}`), msg.channel, !showAll ? "Here are the characters added by you:" : "Characters on added on this server:", client)
                    }, er => errorEvent(er, msg.channel))
                } else {
                    ac.embed(msg.channel, "You do not have permission to show all players.")
                }
            } else {
                sql.getPlayers(msg.guild.id, msg.author.id, x => {
                    ch.pagenatorList(x.map(x => `(${x.region.toUpperCase()}) ${ac.capitalizeFirstLetter(x.name)}-${ac.capitalizeFirstLetter(x.realm)}`), msg.channel, "Here are the characters added by you:", client)
                }, er => errorEvent(er, msg.channel))
            }
        }
    },
]

module.exports = {
    name: "User",
    short: "user",
    commands: commands
}