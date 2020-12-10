const http = require('http');
const fs = require('fs');
const axios = require('axios')
const { MessageEmbed, EmbedField } = require('discord.js');
const moment = require('moment')


module.exports = {

    embed(channel, title, description, color, returnInsteadOfSend) {
        const embed = new MessageEmbed().setTitle(title);
        if (description) {
            embed.setDescription(description);
        }
        if (color) {
            embed.setColor(0xFF0000)
        }
        if (returnInsteadOfSend) {
            return embed
        } else {
            channel.send(embed);
        }
    },
    remove(array, element) {
        const index = array.indexOf(element);
        array.splice(index, 1);
    },
    validURL(str) {
        var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
        return !!pattern.test(str);
    },
    getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    },
    getUserName(id, guild) {
        var user = this.getUser(id, guild)
        if (user) {
            return user.displayName
        } else {
            return null
        }
    },
    getUser(id, guild) {
        return guild.members.find(x => { return x.id == id.toString() })
    },
    DownloadFile(URL, callback) {
        const name = crypto.randomBytes(8).toString("hex");
        var fileName = name + ".jpg"
        const file = fs.createWriteStream(fileName);
        const request = http.get(URL, function(response) {
            response.pipe(file).once("close", x => {
                callback(fileName)
            });

        });
    },
    axiosDownloadFile(URL, callback) {
        const name = crypto.randomBytes(8).toString("hex");
        var fileName = name + ".jpg"

        axios({
            method: "get",
            url: URL,
            responseType: "stream"
        }).then(function(response) {
            response.data.pipe(fs.createWriteStream(fileName).once("close", x => {
                callback(fileName)
            }));
        });
    },
    httpGet(url, callback) {
        axios.get(url).then(x => {
            if (x.data) {
                callback(x.data)
            }
        })
    },
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
    getUnixTimestamp() {
        return moment().valueOf();
    }


}