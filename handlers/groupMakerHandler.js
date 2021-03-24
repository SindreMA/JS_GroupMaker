var log4js = require("log4js");
var logger = log4js.getLogger();
logger.level = "debug";
const sql = require('../helpers/sqlHelper')
const ac = require('../helpers/actions');
const { DMChannel } = require("discord.js");

module.exports = {
        createNewGroup(user, channel, messageTemplate = 1) {
            return new Promise((resolve, reject) => {
                this.deleteMessageSetup(user, channel).then(() => {
                    //old creation have been deleted if it existed

                    const payload = {
                        user: user.id,
                        channel: channel.id,
                        created: ac.getUnixTimestamp(),
                        template: messageTemplate
                    }
                    sql.insertMessageSetup(payload).then(() => {
                        this.sendSetupMessage(user, channel);
                    }).catch(x => {
                        logger.error(x)
                        reject(x)
                    })
                }).catch(x => {
                    logger.error("Couldn't remove old group creation progress for user.")
                    logger.error(x)
                    reject(x)
                })
            })
        },
        deleteMessageSetup(user, channel) {
            return new Promise((resolve, reject) => {
                sql.getMessageSetup(user.id).then(setups => {
                    //console.log("setups", setups);
                    const filtered = setups.filter(x => x.completed)
                    if (filtered.length !== 0) {
                        const ids = filtered.map(x => x.id);
                        sql.deleteMessageSetup(ids).then(x => {
                            resolve()
                        }).catch(x => {
                            reject(x)
                        })
                    } else {
                        resolve()
                    }
                }).catch(x => reject(x))
            })
        },
        sendSetupMessage(user, channel, payload) {
            return new Promise((resolve, reject) => {

                //logger.info("Sending setup message")
                sql.getMessageSetup(user.id).then(setups => {
                    //logger.info("getting message setups")
                    //console.log("setups", setups);
                    //console.log("channel.id", channel.id);
                    //console.log(" user.id", user.id);
                    const filteredSetups = setups.filter(x => parseInt(user.id) === parseInt(x.user) && (parseInt(channel.id) === parseInt(x.channel) || payload))
                        //logger.info("getting spesific setup")
                        //logger.info("filteredSetups", filteredSetups)

                    if (filteredSetups.length !== 0) {
                        const setup = filteredSetups[0]
                            //logger.info("getting message templates")
                        return sql.getMessageTemplates().then(templates => {
                            //console.log("templates", templates);
                            const template = templates.filter(c => c.id === setup.template).length !== 0 ? templates.filter(c => c.id === setup.template)[0] : null
                            if (template) {
                                //logger.info("Getting messsages for template")
                                sql.getMessages(template.id).then(messages => {
                                    //logger.info("Getting progress for setup")
                                    sql.getMessageProgress(setup.id).then(progresses => {

                                        const filteredProgresses = progresses.filter(x => x.completed).sort((a, b) => a.message_id - b.message_id).sort((a, b) => a.id - b.id)
                                        let message = null
                                        if (filteredProgresses.length !== 0) {
                                            const messageProgress = filteredProgresses[filteredProgresses.length - 1]
                                            const nextMsg = messageProgress.message_id + 1 - (1) //order is 1-x while msg index is 0-x
                                            message = messages[nextMsg]
                                        } else {
                                            message = messages[0]
                                        }


                                        if (payload) {
                                            //save progress
                                            var modpayload = {...payload }
                                            modpayload.setupId = setup.id
                                            modpayload.messageId = message.id
                                            let backupReactions = [`1️⃣`, `2️⃣`, `3️⃣`, `4️⃣`, `5️⃣`, `6️⃣`, `7️⃣`, `8️⃣`, `9️⃣`, `🔟`, `0️⃣`]
                                            for (let i = 0; i < backupReactions.length; i++) {
                                                const option = backupReactions[i];
                                                if (option === modpayload.value) {
                                                    modpayload.value = message.options[i].option
                                                }
                                            }
                                            console.log("contine progress", modpayload);
                                            sql.insertMessageProgress(modpayload)

                                            user.createDM().then(DMChannel => {
                                                var newMsg = messages[message.order + 1]
                                                if (newMsg) {
                                                    this.sendMessage(newMsg, DMChannel)
                                                } else {
                                                    console.log("Thing is done");
                                                    //this.PostCompeteMessage(setup)
                                                }

                                            })


                                            /*
                                                payload.setupId: ,
                                                payload.messageId: ,
                                            
                                                */

                                        } else {
                                            user.createDM().then(DMChannel => {
                                                if (false) {
                                                    var embed = ac.embed(DMChannel, `Starting group creation for: ${template.name}`, ``, null, true);
                                                    DMChannel.send(embed)
                                                }
                                                this.sendMessage(message, DMChannel)
                                            })

                                        }
                                    }).catch(X => logger.error(x))

                                }).catch(x => {
                                    reject(x)
                                })
                            } else {
                                reject("The message template you are trying to use does not exist!")
                            }
                        }).catch(x => {
                            logger.error(x)
                            reject(x)
                        })
                    }
                }).catch(x => logger.error(x))
            })
        },

        CreateGroupItem(template, maxtanks, maxhealers, maxdamagers, description, map, msg, title, level) {
            sql.getOptions([1]).then(maps => {
                var mapMatches = maps.filter(c => {
                    if (typeof map === 'number') {
                        return maps[map]
                    } else if (typeof map === 'string') {
                        var split = c.option.split(' ')
                        var shortnName = ''
                        for (const word of split) {
                            if (word.toLowerCase() !== 'the') {
                                shortnName += word[0] //first letter in word
                            }
                        }
                        if (shortnName.toLowerCase() === map.toLowerCase()) {
                            return true //If shortn match
                        } else if (map.toLowerCase() === c.option.toLowerCase()) {
                            return true //If full name match
                        }
                    }
                })

                if (mapMatches.length !== 0) {
                    const selectedMap = mapMatches[0]
                    var GroupItem = {
                        title,
                        description,
                        level,
                        map: selectedMap,
                        admin: msg.author,
                        maxtanks,
                        maxhealers,
                        maxdamagers,

                    }
                    var embed = this.GenerateGroupEmbed(GroupItem)

                    msg.channel.send(embed).then(newMsg => {
                        sql.CreateGroupItem(template, title, description, level, mapMatches[0].order, msg.author.id, msg.channel.id, newMsg.id, maxtanks, maxhealers, maxdamagers)
                        newMsg.react(`🛡️`) //tank
                        newMsg.react(`❤️`) //hearth
                        newMsg.react(`⚔️`) //dps





                    })
                } else {
                    ac.embed(msg.channel, "Could not find map", null, null, false);
                }
            }).catch(x => {
                console.log(x);
                logger.error(x)
                ac.embed(msg.channel, "Something went wreong", null, null, false);
            })
        },
        GenerateGroupEmbed(GroupItem) {
            console.log("test");
            var embed = ac.embed(null, GroupItem.title, GroupItem.description, null, true);

            const tanks = GroupItem.tanks && Array.isArray(GroupItem.tanks) ? GroupItem.tanks : []
            const healers = GroupItem.healers && Array.isArray(GroupItem.healers) ? GroupItem.healers : []
            const damagers = GroupItem.damagers && Array.isArray(GroupItem.damagers) ? GroupItem.damagers : []
            if (GroupItem.maxtanks !== '0') {
                embed.addField(parseInt(GroupItem.maxtanks, 10) > 1 ? 'Tanks' : 'Tank', tanks.length === 0 ? 'None' : `${tanks.join("\n")}`, true)
            }
            if (GroupItem.maxhealers !== '0') {
                embed.addField(parseInt(GroupItem.maxhealers, 10) > 1 ? 'Healers' : 'Healer', healers.length === 0 ? 'None' : `${healers.join("\n")}`, true)
            }
            if (GroupItem.maxtanks !== '0') {
                embed.addField('DPS', damagers.length === 0 ? 'None' : damagers.join("\n"), true)
            }

            embed.addField("Dungeon", GroupItem.map ? GroupItem.map.option : 'Any', true)
            embed.addField("Key level", GroupItem.level ? GroupItem.level : 'Any', true)
                //embed.addField("Level", GroupItem.level)
                //embed.addField("Armor type", GroupItem.level)

            embed.setThumbnail(GroupItem.map.image)
            embed.setTimestamp(ac.getUnixTimestamp)
                //embed.setAuthor(GroupItem.admin.name)

            embed.addField("Info", "You can apply to this group by clicking the reactions under\n", false)
            return embed
        },
        sendMessage(message, channel) {
            console.log("message", message);
            var embed = ac.embed(channel, message.title && message.title, message.description && message.description, null, true);
            console.log("message", message);
            let backupReactions = [`1️⃣`, `2️⃣`, `3️⃣`, `4️⃣`, `5️⃣`, `6️⃣`, `7️⃣`, `8️⃣`, `9️⃣`, `🔟`, `0️⃣`]
            let usedReaction = []

            if (message.options && message.options.length !== 0) {

                embed.addField("Click on a reaction to respond",
                        `${message.options.sort((a,b)=> a.order - b.order).sort((a,b)=> a.preferred_reaction ? 1 : 0).map(x=>  {
                if (x.preferred_reaction) {
                    usedReaction.push(x.preferred_reaction)
                    return `${x.preferred_reaction} = ${x.option}`
                } else {
                    const reactions = backupReactions.filter(c=> !usedReaction.includes(c))
                    if (reactions[0]) {
                    usedReaction.push(reactions[0])
                        return `${reactions[0]} = ${x.option}`    
                    }
                }
                return
            }).join('\n')}`)
            
        }
        channel.send(embed).then(msg => {
            usedReaction.forEach(reaction => {
                msg.react(reaction)
            });
        })
    },

    handleAction(type, action, _user, client) {
        if (type === 'message') {
            const message = action
            const channel = message.channel
            const user = message.author

            let payload = {
                value: message.content,
                completed: true
            }

            this.sendSetupMessage(user, channel, payload)
        } else if (type === 'reaction') {
            const reaction = action
            const message = reaction.message
            const channel = message.channel

            const user = _user

            let payload = {
                value: reaction.emoji.name,
                completed: true
            }
            if (channel.guild) { //Is GuildChannel
                if (message.author.id === client.user.id) {
                    sql.GetGroupItem(message.id).then(x=> {
                        if (x && x.length !== 0) {
                            const ev = x[0]
                            let role = null
                            if (payload.value === `🛡️`) {
                                role = 'tank'
                            } else if (payload.value === `❤️`) {
                                role = 'healer'
                            } else if (payload.value === `⚔️`) {
                                role = 'damage'
                            }
                            
                            var maxOfRole = ev[`max${role}s`]
                            for (let i = 1; i < maxOfRole +1; i++) {
                                const spotText = `${role}${i}`
                                const spot = ev[spotText];
                                if (!spot) {

                                    var tanks = GetPlayers('tank', ev)
                                    if (role === 'tank') tanks.push(user.id)

                                    var healers = GetPlayers('healer', ev)
                                    if (role === 'healer') healers.push(user.id)

                                    var damagers = GetPlayers('damage', ev)
                                    if (role === 'damage') damagers.push(user.id)

                                  sql.TakeGroupItemSpot(ev.id, spotText, user.id).then(c=> {
                                     sql.getOptions([1]).then(c=> {
                                        var GroupItem = {
                                            title: ev.title,
                                            description: ev.description,
                                            level: ev.level,
                                            map: c.filter(v=> v.id == ev.map)[0],
                                            admin: ev.admin,
                                            maxtanks: ev.maxtanks,
                                            maxhealers: ev.maxhealers,
                                            maxdamagers: ev.maxdamagers,
                                            tanks,
                                            healers,
                                            damagers
                                        }
                                          var embed = this.GenerateGroupEmbed(GroupItem)
                                        message.edit(embed)
                                        .then(msg => console.log(`Updated the content of a message`))
                                        .catch(console.error);
                                     })                                    
                                  })
                                  break;
                                } 
                            }
                        }
                    })    
                }
            } else { //Is DMChannel
                this.sendSetupMessage(user, channel, payload)
            }
        }
    }

}

function GetPlayers (role, ev) {
    const keys = Object.keys(ev)
    var players = []
    for (const key of keys) {
        if (key.toLowerCase().startsWith(role.toLowerCase())) {
            if (ev[key]) {
                players.push(ev[key])   
            }
        }
    }
    return players

}