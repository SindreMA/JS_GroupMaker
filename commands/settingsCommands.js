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

var commands = [{
    command: 'settings',
    description: 'Shows the settings set',
    requirePermission: ['ADMINISTRATOR'],
    function: (args, msg, settings) => {
        var embed = ac.embed(msg.channel, "Settings", "Here are the current settings for the bot", null, true);

        for (const key in settings) {
            if (settings.hasOwnProperty(key)) {
                const element = settings[key];
                if (element !== null && key && key !== "id" && key != "changed_timestamp" && key !== "added_timestamp") {
                    embed.addField(formatSettingName(key), formatSettingValue(element, msg.guild), false)
                }
            }
        }
        msg.channel.send(embed);
    }
}, ]

module.exports = {
    name: "Settings",
    short: "settings",
    commands: commands
}

function formatSettingName(name) {
    var newName = genhelper.capitalize(name);
    if (newName.includes('_')) {
        var ls = []
        const words = newName.split('_')
        words.forEach(word => {
            ls.push(genhelper.capitalize(word))
        });
        newName = ls.join(' ');
    }
    return newName;
}

function formatSettingValue(value, guild) {
    var val = value;

    if ((typeof val === 'string' || val instanceof String) && val.length === 2) val = val.toUpperCase()
    if (!isNaN(value) && value.length > 15) {
        if (guild.roles.cache.has(value)) {
            var role = guild.roles.cache.get(value)
            val = `**${role.name}** *(${val})*`
        } else if (guild.channels.cache.has(value)) {
            var channel = guild.channels.cache.get(value)
            val = `**${channel.name}** *(${val})*`
        }
    }
    if (value === true) val = "Active";
    else if (value === false) val = "Inactive";

    return val;
}