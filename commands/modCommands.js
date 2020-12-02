const ch = require('../helpers/commadHelper')
const genhelper = require('../helpers/generalHelper')
const ac = require('../helpers/actions')
const wowHelper = require('../helpers/wowHelper')
const sql = require('../helpers/sqlHelper')
const fs = require('fs')
const logger = require('../globals').logger


var errorEvent = (error, channel) => {
    ac.embed(channel, `Something went wrong: ${error}`)
}

var commands = []

module.exports = {
    name: "Moderation",
    short: "mod",
    commands: commands
}