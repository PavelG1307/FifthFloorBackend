const Pool = require('pg').Pool
console.log(process.env.dbUser, process.env.dbPassword, process.env.dbPort, process.env.dbName,  (process.env.NODE_ENV==='development') ? process.env.dbHost : 'localhost')
const pool = new Pool({
    user: process.env.dbUser,
    password: process.env.dbPassword,
    host: (process.env.NODE_ENV==='development') ? process.env.dbHost : 'localhost',
    port: process.env.dbPort,
    database: process.env.dbName
})

module.exports = pool;