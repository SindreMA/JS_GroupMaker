const ch = require('./commadHelper')
const ac = require('./actions')
const fs = require('fs')
const moment = require('moment')
const globals = require('../globals')

const { Pool, Client } = require('pg')
const pool = new Pool({
    user: globals.sql_login.user,
    host: globals.sql_login.host,
    database: globals.sql_login.database,
    password: globals.sql_login.password,
    port: globals.sql_login.port,
})

module.exports = {
        getSettings(discord_id, successCallback, errorCallback) {

            pool.query(`SELECT id, self_service, management_role, changed_timestamp, added_timestamp, keystone_post_channel, affix_post_channel, region FROM public."Settings" where id = ${discord_id};`, (err, res) => {
                if (!err && res && res.rowCount === 0) {
                    var settings = getDefaultSettings(discord_id)
                    this.saveSettings(settings, true, successCallback)
                } else if (res && res.rows && res.rowCount !== 0) {
                    return successCallback(res.rows[0])
                } else if (err) {
                    errorCallback(err)
                }
            })
        },
        saveSettings(payload, doesntExist, successCallback, errorCallbackr) {
            if (payload && payload.id) {
                var ls = []
                var colums = []
                var values = []
                payload.changed_timestamp = moment().valueOf();

                for (var propertyName in payload) {
                    var value = isNaN(payload[propertyName]) ? `'${payload[propertyName]}'` : payload[propertyName]
                    if (payload[propertyName] !== null) {
                        colums.push(propertyName)
                        values.push(value)
                    }
                    ls.push({ column: propertyName, value: value })

                }
                if (!colums.includes('added_timestamp')) {
                    colums.push('added_timestamp')
                    values.push(moment().valueOf())
                }
                if (doesntExist) {
                    pool.query(`INSERT INTO public."Settings"(${colums.join(',')}) VALUES (${values.join(',')});`, (err, res) => {
                        console.log("Server settings saved!");
                        successCallback(payload)
                    })
                } else {
                    var query = `UPDATE public."Settings" SET ${ls.map(x=> `${x.column}=${x.value == null ? 'NULL' : x.value }`).join(',')} WHERE id = ${payload.id};`;
                console.log(query);
                
                pool.query(query, (err, res) => {
                    console.log("Server settings updated!");
                    successCallback(payload)
                    
                  })
            }
             
        }
    },
    getPlayer(discord_id, payload, successCallback, errorCallback) {
        if (discord_id && payload && payload.name && payload.realm && payload.region) {
            pool.query(`SELECT discord_id, name, realm, region, added_by, added_timestamp FROM public."Players" where discord_id = ${discord_id} and name = '${payload.name.toLowerCase()}' and region = '${payload.region.toLowerCase()} and realm = ''${payload.realm.toLowerCase()}'' limit 1`, (err, res) => {
                if (res && res.rows) {
                    successCallback(res.rows[0])
                } else {
                    errorCallback(err)
                }
              })
        }
    },
    getPlayers(discord_id, user_id, successCallback, errorCallback) {
        if (discord_id ) {
            var LimitForUser = "";
            if (user_id != null) {
                LimitForUser = `and added_by = ${user_id}`
            }
            pool.query(`SELECT discord_id, name, realm, region, added_by, added_timestamp FROM public."Players" where discord_id = ${discord_id} ${LimitForUser}`, (err, res) => {
                if (res && res.rows) {
                    successCallback(res.rows)
                } else {
                    errorCallback(err)
                }
              })
        }
    },
    cleanText(str) {
        var res = str.replace(/[']+/g, '')
        return res
    },
    getGuilds(discord_id, successCallback, errorCallback) {
        if (discord_id ) {           
            pool.query(`SELECT discord_id, region, guild_id, faction, added_by, added_timestamp, name, realm FROM public."Guilds" where discord_id = ${discord_id}`, (err, res) => {
                if (res && res.rows) {
                    successCallback(res.rows)
                } else {
                    errorCallback(err)
                }
              })
        }
    },

    addPlayer(discord_id, payload, successCallback, errorCallback) {
        if (discord_id && payload && payload.name && payload.realm && payload.region && payload.added_by) {
                pool.query(`INSERT INTO public."Players"(discord_id, name, realm, region, added_by, added_timestamp) VALUES (${discord_id}, '${f(payload.name)}', '${f(payload.realm)}', '${f(payload.region)}', ${payload.added_by}, ${moment().valueOf()});`, (err, res) => {
                    if (res && res.rows) {
                        successCallback(res)
                    } else {
                        errorCallback(err)
                    }
                  })
                } else errorCallback("Can't add player to SQL cause payload were missing data")
    },
    removePlayer(discord_id, payload, successCallback, errorCallback) {
        if (discord_id && payload && payload.name && payload.realm && payload.region && (payload.user || payload.admin)) {
            pool.query(`DELETE FROM public."Players" WHERE name = '${f(payload.name)}' and realm = '${f(payload.realm)}' and region = '${f(payload.region)}' ${payload.user ? ` and added_by = ${payload.user}`: ''};`, (err, res) => {
                if (res && res.rows) {
                    successCallback(res)
                } else {
                    errorCallback(err)
                }
              })
            } else errorCallback("Can't remove player from SQL cause payload were missing data")
    },
    addGuild(discord_id, payload, successCallback, errorCallback) {
        if (discord_id && payload && payload.name && payload.realm && payload.region && payload.added_by && payload.region && payload.name && payload.faction && payload.id) {
            pool.query(`INSERT INTO public."Guilds"(discord_id, region, guild_id, faction, added_by, added_timestamp, name, realm) VALUES (${discord_id}, '${payload.region}', ${payload.id}, '${payload.faction}', ${payload.added_by}, ${moment().valueOf()}, '${payload.name}', '${payload.realm}');`, (err, res) => {
                if (res && res.rows) {
                    successCallback(res)
                } else {
                    errorCallback(err)
                }
              })
    } else errorCallback("Can't add guild to SQL cause payload were missing data")
    },
    removeGuild(discord_id, payload, successCallback, errorCallback) {
        if (discord_id && payload && payload.name && payload.realm && payload.region && (payload.user || payload.admin)) {
            pool.query(`DELETE FROM public."Guilds" WHERE name = '${f(payload.name)}' and realm = '${f(payload.realm)}' and region = '${f(payload.region)}' ${payload.user ? ` and added_by = ${payload.user}`: ''};`, (err, res) => {
                if (res && res.rows) {
                    successCallback(res)
                } else {
                    errorCallback(err)
                }
              })
        } else errorCallback("Can't remove guild from SQL cause payload were missing data")
    }
}

function getDefaultSettings(discord_id) {
    var settings = {
        id : discord_id,
        self_service: true,
        management_role: null,
        changed_timestamp: null,
        trigger_amount : 1,
        added_timestamp: moment().valueOf(),
        region: 'eu',
    }    
    return settings;
}
function f(input) {
    return input.split(`'`).join('`');
}