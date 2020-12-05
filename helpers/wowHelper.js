var ac = require('./actions')
const axios = require('axios')
var log4js = require("log4js");
var logger = log4js.getLogger();
logger.level = "debug";

module.exports = {
        GetPlayerDetails(name, realm, region, checkblizzard) {
            var url = `https://api2.bestkeystone.com/api/Player/new_details?character=${name}&realm=${realm}&region=${region}${checkblizzard ? `&checkblizzard=${checkblizzard}` :""}`;
            logger.info("Fetching", url);
            const encodedURI = encodeURI(url);

            return axios.get(encodedURI)
        },
        GetGuildDetails(name,realm,region, checkblizzard)  {
            var url = `http://direct.bestkeystone.com:50486/api/Guild?name=${name}&realm=${realm}&region=${region}${checkblizzard ? `&checkblizzard=${checkblizzard}` :""}`;
            logger.info("Fetching", url);
            const encodedURI = encodeURI(url);

            return axios.get(encodedURI)
        },
        GetSpecs() {
            var url = `https://api2.bestkeystone.com/api/Spec/all`;            
            logger.info(`Fetching ${url}`);
            return axios.get(url)
        },
        GetSpec(id, specs) {
            
            for (let index = 0; index < specs.length; index++) {
                const spec = specs[index];
                if (spec.id === id) {
                    return spec
                }
            }

        },
        GetClasses() {
            var url = `https://api2.bestkeystone.com/api/Class/all`;
            logger.info("Fetching", url);
            return axios.get(url)
        },
        GetClass(id, classes) {
            for (let index = 0; index < classes.length; index++) {
                const spec = classes[index];
                if (spec.id === id) {
                    return spec
                }
            }
        },
        EmoteFromRole(role) {
            if (role === 'DAMAGE') return ':crossed_swords:';
            else if (role === 'TANK') return ':shield:';
            else if (role === 'HEALER') return ':green_heart:'
        }
    }