const ch = require('../helpers/commadHelper')
const genhelper = require('../helpers/generalHelper')
const ac = require('../helpers/actions')
const wowHelper = require('../helpers/wowHelper')
const sql = require('../helpers/sqlHelper')
const fs = require('fs')
var log4js = require("log4js");
var logger = log4js.getLogger();
logger.level = "debug";

var errorEvent = (error, channel) => {
    ac.embed(channel, `Something went wrong: ${error}`)
}

var commands = []

module.exports = {
    name: "Moderation",
    short: "mod",
    commands: commands
}