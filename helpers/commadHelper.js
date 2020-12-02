const ac = require('../helpers/actions')
const moment = require('moment')
var momentDurationFormatSetup = require("moment-duration-format");
momentDurationFormatSetup(moment);
typeof moment.duration.fn.format === "function";
typeof moment.duration.format === "function";

module.exports = {
    
    requireVoice(member) {
        if (member && member.voice && member.voice.channelID) {
            return true
        } else {
            return false
        }
    },
    requireBotInVoice(_gid, client, channel) {
        var rtn = false
        if (client.voice) {
            client.voice.connections.forEach((connection, id) => {
                var gid = connection.channel.guild.id;
                if (gid === _gid) {
                    rtn = true;
                }
            })
        }

        if (!rtn) {
            if (channel) {
                channel.send(`Juky needs to be in voice for this command to work.`)
            }
            return false
        } else {
            return true
        }
    },

    matchCommand(userCommand, cmdCommand, aliasLs) {
        if (userCommand.toLowerCase() === cmdCommand.toLowerCase()) {
            return true
        } else {
            if (aliasLs) {
                for (let p = 0; p < aliasLs.length; p++) {
                    const alias = aliasLs[p];
                    if (alias) {
                        if (userCommand.toLowerCase() === alias.toLowerCase()) {
                            return true
                        }
                    }

                }
            }

            return false
        }
    },
    getListItem(channels, id) {
        channels.forEach(item => {
            if (id === item.id) {
                return item;
            }
        });
    },

    chunkArray(myArray, chunk_size) {
        var index = 0;
        var arrayLength = myArray.length;
        var tempArray = [];

        for (index = 0; index < arrayLength; index += chunk_size) {
            myChunk = myArray.slice(index, index + chunk_size);
            // Do something if you want with the group
            tempArray.push(myChunk);
        }

        return tempArray;
    },
    pagenatorList(ls, channel, title, client) {
        if (ls.length === 0) {
            var embed = ac.embed(false, "List is empty", false, '0x00ff00', true)
            channel.send(embed)
        } else {
            var pages = this.chunkArray(ls, 25)
        var embed = ac.embed(false, title, false, '0x00ff00', true)
        var page = 0;

        embed.description = "```" + pages[page].join("\n") + "```"
        embed.title = `${title} (${page + 1}/${pages.length})`
        channel.send(embed).then(msg => {
            msg.react("⬅️")
            msg.react("➡️")
            var showBtn = x => {
                if (page == 0) {
                    x.users.remove(client.user)
                } else {
                    if (!x.message.reactions.resolve("⬅️") || !x.message.reactions.resolve("⬅️").users.resolve(client.user)) {
                        msg.react("⬅️")
                    }
                }
                if (page == pages.length - 1) {
                    x.users.remove(client.user)
                } else {
                    if (!x.message.reactions.resolve("➡️") || !x.message.reactions.resolve("➡️").users.resolve(client.user)) {
                        msg.react("➡️")
                    }
                }
            }
            client.on('messageReactionAdd', (msgReaction, user) => {

                if (!user.bot) {
                    if (msgReaction.message.id == msg.id) {
                        if (msgReaction.emoji.name == '➡️') {
                            msgReaction.users.remove(user)
                            if (page != pages.length - 1) {
                                page += 1;
                                embed.description = "```" + pages[page].join("\n") + "```"
                                embed.title = `${title} (${page + 1}/${pages.length})`
                                msg.edit(embed)
                                //showBtn(msgReaction)    
                            }
                        } else if (msgReaction.emoji.name == '⬅️') {
                            msgReaction.users.remove(user)
                            if (page != 0) {
                                page = page - 1;
                                embed.description = "```" + pages[page].join("\n") + "```"
                                embed.title = `${title} (${page + 1}/${pages.length})`
                                msg.edit(embed)
                                //showBtn(msgReaction)
                            }
                        }
                    }
                }
            })
        })
        }
        

    }


}