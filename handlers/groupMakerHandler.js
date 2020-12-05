var logger = log4js.getLogger();
logger.level = "debug";

module.exports = {
    createNewGroup(msg, _client) {
        return new Promise((resolve, reject) => {
            this.deleteOldGroups()
        })
    }
}