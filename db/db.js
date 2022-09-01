const Pool = require('pg').Pool
const pool = new Pool({
    user: process.env.dbUser,
    password: process.env.dbPassword,
    host: process.env.NODE_ENV==='development' ? process.env.dbHost : 'localhost',
    port: process.env.dbPort,
    database: process.env.dbName
})

module.exports = pool;