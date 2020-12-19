const fs = require('fs')
const actions = require('../helpers/actions')
const ch = require('../helpers/commadHelper')
const globals = require('../globals')
var log4js = require("log4js");
var logger = log4js.getLogger();
logger.level = "debug";
const config = require('C:\\tools\\groupmaker.json')
const ac = require('../helpers/actions')
const sql = require('../helpers/sqlHelper')
const gh = require('../handlers/groupMakerHandler')

var client = null


module.exports = {
    messageRecived(msg, _client) {
        if (!msg.guild) {
            UserMessageHandler(msg)
            return
        };
        client = _client;

        if (msg.content.startsWith(config.prefix)) {
            logger.info(`Message Reviced: ${msg.author.username}: ${msg.content}`);
            var command = msg.content.substr(1);
            var args = []

            if (command.includes(' ')) {
                var split = command.match(/(?:[^\s"]+|"[^"]*")+/g)
                command = split[0]
                actions.remove(split, command)
                args = split.map(x => x.replace(/["]+/g, ''))
            }

            const noneEmptyCommandItems = globals.commandsItems.filter(x => x && x.commands)
            var commands = noneEmptyCommandItems.flatMap(x => {
                if (typeof x.commands == "function") {
                    return x.commands(noneEmptyCommandItems)
                } else {
                    return x.commands
                }
            })
            ExecuteCommands(command, args, msg, commands);
        }
    }
}


UserMessageHandler = (msg) => {
    gh.handleAction("message", msg)
}

function ExecuteCommands(command, args, msg, commands) {
    logger.debug('Checking if message is command!')
    CommandCheck(command, commands).then(commandItem => {
                logger.debug('Command exist!')
                logger.debug('Getting server settings')
                sql.getSettings(msg.guild.id, settings => {
                            logger.debug('Got settings')
                            PermissionCheck(commandItem.requirePermission, settings, msg.member, settings.self_service && commandItem.selfserviceSupport).then(() => {
                                        ArgumentCheck(args, commandItem.requireArgs).then(() => {
                                                //Executing function...
                                                try {
                                                    commandItem.function(args, msg, settings, client)
                                                } catch (error) {
                                                    logger.error(error)
                                                    ac.embed(msg.channel, `${error}`)
                                                }
                                            }).catch(err => {
                                                    if (err) {
                                                        logger.error(err)
                                                    } else {
                                                        ac.embed(msg.channel, `Missing expected arguments. ${commandItem.args && commandItem.args.length !== 0 ? `Make sure to pass ${commandItem.args.join(', ')} in that order!`: ''}`)
                    }
                })
            }).catch(err => {
                if (err) {
                    logger.error(err)                        
                } else {
                    ac.embed(msg.channel, "You do not have permission to use this command!")
                }
            })
        }, err => {logger.error(`Error: ${err}`)});
    }).catch(err => {
        //Msg wasn't a command
        if (err) {
            logger.error(err)                        
        } 
    })
}
function CommandCheck(command, commands) {
    return new Promise((resolve, reject) => {
        var matchCommands = commands.filter(x => x && command && x.command.toLowerCase() === command.toLowerCase())
        if (matchCommands.length != 0) {
            resolve(matchCommands[0]);
        } else {
            reject("No matching command found!")
        }
    })
}
function ArgumentCheck(args, requiredArgs, commandArgs) {
    return new Promise((resolve, reject) => {
        if (requiredArgs && requiredArgs.length != 0) {
            if (requiredArgs === args.length || requiredArgs.filter(x => args.length === x).length !== 0) {
                resolve()
            } else {
                reject();
            }
        } else {
            resolve();
        }
    })
}
function PermissionCheck(requirePermissions, settings, member, override) {
    return new Promise((resolve, reject) => {
        if (override) resolve();
        else {
            if (requirePermissions && requirePermissions.length != 0) {
                var hasPerm = false
                requirePermissions.forEach(permission => {
                    if (!hasPerm && member.hasPermission(permission)) hasPerm = true;
                    else if (!hasPerm && settings[permission] !== undefined && !isNaN(settings[permission])) {
                        if (member.GuildMemberRoleManager.cache.hasPerm(settings[permission])) hasPerm = true;
                    }
                });
                if (hasPerm) {
                    resolve();
                } else {
                    reject();
                }
            } else {
                resolve();
            }
        }
    })

}