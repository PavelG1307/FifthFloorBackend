const Pool = require('pg').Pool
const pool = new Pool({
    user: 'pavel',
    password: 'root',
    host: 'localhost',
    port: 5432,
    database: 'fifthfloor'
})

module.exports = pool;