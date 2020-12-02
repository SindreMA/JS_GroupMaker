const ch = require('../helpers/commadHelper')
const ac = require('../helpers/actions')
const logger = require('../globals').logger

var errorEvent = (error, channel) => {
    ac.embed(channel, `Something went wrong: ${error}`)
}

var commands = [
    {
    command: 'affix', 
    description: 'Shows the current affix', 
    function: (args, msg,settings) => {
        ac.httpGet(`https://api2.bestkeystone.com/api/Affix/All`,affixes=> {
            ac.httpGet(`https://api2.bestkeystone.com/api/Affix/GetWeeklyCombonation?region=eu`, currentCombo=> {
                var embed = ac.embed(msg.channel,"Current affixes",false,false,true)
            currentCombo.forEach(affix => {
                var affixDetails = affixes.find(x=> {return affix == x.id})
                embed.addField(affixDetails.name, affixDetails.description,true)
            });
            msg.channel.send(embed)
            })
        })
    }}
]

module.exports =  {
    name: "Wow",
    short: "wow",
    commands: commands
}