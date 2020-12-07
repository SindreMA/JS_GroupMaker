var log4js = require("log4js");
var logger = log4js.getLogger();
logger.level = "debug";
const sql = require('../helpers/sqlHelper')
const ac = require('../helpers/actions')


module.exports = {
    createNewGroup(user, channel, messageTemplate = 1) {
        return new Promise((resolve, reject) => {
            this.deleteOldGroupsCreations(user, channel).then(() => {
                //old creation have been deleted if it existed
                sql.insertChannelMessagesProgress(user, channel, messageTemplate).then(() => {
                    sql.getMessageTemplates().then(templates => {
                        const template = templates.filter(c => c.id === messageTemplate).length !== 0 ? templates.filter(c => c.id === messageTemplate)[0] : null
                        if (template) {
                            sql.getMessages(template.id).then(messages => {
                                var embed = ac.embed(channel, user.DMChannel.send(messages[0]), ``, null, true);
                                channel.send(embed)
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
    deleteOldGroupsCreations(user, channel) {
        return new Promise((resolve, reject) => {
            sql.getChannelMessagesProgress(user.id).then(progresses => {
                if (progresses.length !== 0) {
                    const ids = progresses.map(x => x.id);
                    sql.deleteChannelMessagesProgress(ids).then(x => {
                        resolve()
                    }).catch(x => {
                        reject(x)
                    })
                } else {
                    resolve()
                }
            }).catch(x => reject(x))
        })
    }
}