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

var commands = []

module.exports = null
    /*{
        name: "User",
        short: "user",
        commands: commands
    }
    */