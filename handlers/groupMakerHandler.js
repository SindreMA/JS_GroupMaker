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
    sendSetupMessage(user, channel, msg) {
        return new Promise((resolve, reject) => {

            logger.info("Sending setup message")
            sql.getMessageSetup(user.id).then(setups => {
                logger.info("getting message setups")
                console.log("setups", setups);
                console.log("channel.id", channel.id);
                console.log(" user.id", user.id);
                const filteredSetups = setups.filter(x => parseInt(user.id) === parseInt(x.user) && parseInt(channel.id) === parseInt(x.channel))
                logger.info("getting spesific setup")
                logger.info("filteredSetups", filteredSetups)

                if (filteredSetups.length !== 0) {
                    const setup = filteredSetups[0]
                    logger.info("getting message templates")
                    return sql.getMessageTemplates().then(templates => {
                        console.log("templates", templates);
                        const template = templates.filter(c => c.id === setup.template).length !== 0 ? templates.filter(c => c.id === setup.template)[0] : null
                        if (template) {
                            logger.info("Getting messsages for template")
                            sql.getMessages(template.id).then(messages => {
                                logger.info("Getting progress for setup")
                                sql.getMessageProgress(setup.id).then(progresses => {

                                    const filteredProgresses = progresses.filter(x => x.completed).sort((a, b) => a.message_id - b.message_id).sort((a, b) => a.id - b.id)
                                    let message = null
                                    if (filteredProgresses.length !== 0) {
                                        const messageProgress = filteredProgresses[filteredProgresses.length - 1]
                                        message
                                    } else {
                                        message = messages[0]
                                    }


                                    if (msg) {
                                        //save progress
                                        console.log("contine progress");
                                        /*
                                        let payload = {
                                            value: ,
                                            completed: ,
                                            setupId: ,
                                            messageId: ,
                                        }
                                        sql.insertMessageProgress()
                                        */

                                    } else {
                                        user.createDM().then(DMChannel => {
                                            if (true) {
                                                var embed = ac.embed(DMChannel, `Starting group creation for: ${template.name}`, ``, null, true);
                                                DMChannel.send(embed)
                                            }
                                            if (true) {
                                                var embed = ac.embed(DMChannel, message.title && message.title, message.description && message.description, null, true);
                                                DMChannel.send(embed)
                                            }
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
    handleAction = (type, action, _user) => {
        if (type === 'message') {
            const message = action
            const user = message.author

        } else if (type === 'reaction') {
            const reaction = action
            const user = _user
        }
    }

}