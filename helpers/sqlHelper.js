const ch = require('./commadHelper')
const ac = require('./actions')
const fs = require('fs')
const moment = require('moment')
const config = require('C:\\tools\\groupmaker.json')

const { Pool, Client } = require('pg')
const { Logger } = require('log4js')
const pool = new Pool({
    user: config.sql_user,
    host: config.sql_host,
    database: config.sql_database,
    password: config.sql_password,
    port: config.sql_port,
})

module.exports = {
        getSettings(discord_id, successCallback, errorCallback) {

            pool.query(`SELECT id, changed_timestamp, added_timestamp FROM public."GuildSettings" where id = ${discord_id};`, (err, res) => {
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
                    pool.query(`INSERT INTO public."GuildSettings"(${colums.join(',')}) VALUES (${values.join(',')});`, (err, res) => {
                        console.log("Server settings saved!");
                        successCallback(payload)
                    })
                } else {
                    var query = `UPDATE public."GuildSettings" SET ${ls.map(x=> `${x.column}=${x.value == null ? 'NULL' : x.value }`).join(',')} WHERE id = ${payload.id};`;
                console.log(query);
                
                pool.query(query, (err, res) => {
                    console.log("Server settings updated!");
                    successCallback(payload)
                    
                  })
            }
             
        }
    },
   
    cleanText(str) {
        var res = str.replace(/[']+/g, '')
        return res
    },
    getMessageSetup(user_id) {
        return new Promise((resolve, reject) => {
            const query = `SELECT id, "user", channel, created, completed, template FROM public."ActiveMessageSetups" where "user"=${user_id};`;
            console.log("query", query);
            pool.query(query, (err,res) => {
                if (!err && res && res.rowCount === 0) {
                    resolve([])
                } else if (res && res.rows && res.rowCount !== 0) {
                    resolve(res.rows)
                } else if (err) {
                    reject(err)
                }
            })
        })        
    },
    deleteMessageSetup(ids) {
        return new Promise((resolve, reject) => {
            if (ids && ids.length !== 0) {
                const query = `delete FROM public."ActiveMessageSetups" where completed = false ${ids.length !== 0 ? 'AND' : ''} ${ids.map(x=> ` id != ${x}` ).join(' AND ')} = ${user_id};`;
                console.log("query",query);
                pool.query(query, (err,res) => {
                    if (!err) {
                        resolve()
                    } else {
                        reject(err)
                    }
                })   
            } else {
                resolve([])
            }            
        })        
    },
    finishMessageSetup(id) {
        return new Promise((resolve, reject) => {
            if (id) {
                pool.query(`UPDATE public."ActiveMessageSetups" SET completed=TRUE WHERE id = ${id};`, (err,res) => {
                    if (!err) {
                        resolve()                    
                    } else {
                        reject(err)
                    }
                })
            } else {
                reject("id or payload wrong")
            }            
        })        
    },
    insertMessageSetup(payload) {
        return new Promise((resolve, reject) => {
            if (payload) {
                pool.query(`INSERT INTO public."ActiveMessageSetups"("user", channel, created, template) VALUES (${payload.user}, ${payload.channel}, ${payload.created}, ${payload.template});`, (err,res) => {
                    if (!err) {
                        resolve()                    
                    } else {
                        reject(err)
                    }
                })
            } else {
                reject("id or payload wrong")
            }            
        })        
    },
    getMessageTemplates() {
        return new Promise((resolve, reject) => {
            pool.query(`SELECT id, created, name FROM public."MessageTemplates";`, (err,res) => {
                if (!err && res && res.rowCount === 0) {
                    resolve([])
                } else if (res && res.rows && res.rowCount !== 0) {
                    resolve(res.rows)
                } else if (err) {
                    reject(err)
                }
            })
        })        
    },
    getMessages(template_id) {
        return new Promise((resolve, reject) => {
            const query = `SELECT message, "order", template_id, title, id FROM public."Messages" where template_id = ${template_id};`
            //console.log("query", query);
            pool.query(query, (err,res) => {
                if (!err && res && res.rowCount === 0) {
                    resolve([])
                } else if (res && res.rows && res.rowCount !== 0) {
                    this.getOptions(res.rows.map(x=> x.id)).then(allOptions=> {
                        //console.log("messsage from sql", allOptions);
                        const resultWithOptions = res.rows.map(x=> {return {...x, options: allOptions.filter(c=> c.message_id === x.id)}})
                        resolve(resultWithOptions)
                    }).catch(x=> {
                        reject(x)
                    })                    
                } else if (err) {
                    reject(err)
                }
            })
        })        
    },
    getOptions(message_ids) {
        return new Promise((resolve, reject) => {
            const query = `SELECT message_id, option, preferred_reaction, "order", id FROM public."Options" where ${message_ids.map(x=> ` message_id = ${x}` ).join(' or ')}`;
            //console.log("options querry",query);
            pool.query(query, (err,res) => {
                if (!err && res && res.rowCount === 0) {
                    resolve([])
                } else if (res && res.rows && res.rowCount !== 0) {
                    resolve(res.rows)
                } else if (err) {
                    reject(err)
                }
            })
        })        
    },
    getMessageProgress(setupId) {
        return new Promise((resolve, reject) => {
            pool.query(`SELECT id, value, added, completed, message_setup_id, message_id FROM public."MessageProgress" where message_setup_id = ${setupId}`, (err,res) => {
                if (!err && res && res.rowCount === 0) {
                    resolve([])
                } else if (res && res.rows && res.rowCount !== 0) {
                    resolve(res.rows)
                } else if (err) {
                    reject(err)
                }
            })
        })   
    },
    insertMessageProgress(payload) {
        return new Promise((resolve, reject) => {
            pool.query(`INSERT INTO public."MessageProgress"(value, added, completed, message_setup_id, message_id) VALUES ('${payload.value}', ${ac.getUnixTimestamp()}, ${payload.completed ? 'TRUE' : 'FALSE'}, ${payload.setupId}, ${payload.messageId});`, (err,res) => {
                if (!err && res && res.rowCount === 0) {
                    resolve([])
                } else if (res && res.rows && res.rowCount !== 0) {
                    resolve(res.rows)
                } else if (err) {
                    reject(err)
                }
            })
        })   
    }
}

function getDefaultSettings(discord_id) {
    var settings = {
        id : discord_id,
        changed_timestamp: null,
        added_timestamp: moment().valueOf(),
    }    
    return settings;
}
function f(input) {
    return input.split(`'`).join('`');
}