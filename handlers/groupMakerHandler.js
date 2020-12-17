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
                    this.sendSetupMessage(user);
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
                console.log("setups", setups);
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
    sendSetupMessage(user, channel) {
        sql.getMessageSetup(user.id).then(setups => {
            const filteredSetups = setups.filter(x => x.completed && user.id === x.user && channel.id === x.channel)
            if (filteredSetups.length !== 0) {
                const setup = filteredSetups[0]
                return sql.getMessageTemplates().then(templates => {
                    console.log("templates", templates);
                    const template = templates.filter(c => c.id === messageTemplate).length !== 0 ? templates.filter(c => c.id === setup.template)[0] : null
                    if (template) {
                        sql.getMessages(template.id).then(messages => {

                            sql.getMessageProgress(setup.id).then(progresses => {

                                const filteredProgresses = progresses.filter(x => x.completed).sort((a, b) => a.message_id - b.message_id).sort((a, b) => a.id - b.id)
                                let messageProgress = 0
                                if (filteredProgresses.length !== 0) {
                                    messageProgress = filteredProgresses[filteredProgresses.length - 1]
                                }



                                const newMsg = messages[messageProgress]


                                console.log("user", user);
                                user.createDM().then(DMChannel => {
                                    if (true) {
                                        var embed = ac.embed(DMChannel, `Starting group creation for: ${template.name}`, ``, null, true);
                                        DMChannel.send(embed)
                                    }
                                    if (true) {
                                        var embed = ac.embed(DMChannel, messages[0].title, ``, null, true);
                                        DMChannel.send(embed)
                                    }
                                })

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
    }

}