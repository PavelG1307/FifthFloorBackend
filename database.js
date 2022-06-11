const mysql = require('mysql');

const config = {
    host: 'db4free.net',
    user: 'pavelg1307',
    password: 'Ghjugfr123',
    database: 'fifthfloor'
};

const pool = mysql.createPool(config);
// module.exports = pool;
// pool.query('SELECT * FROM users', (error, result) => {
//     if (error) throw error;
 
//     // response.send(result);
// });

pool.query("CREATE TABLE `users` (`id`       int(11)     unsigned NOT NULL AUTO_INCREMENT, `name`     varchar(30) DEFAULT '', `email`    varchar(50) DEFAULT '', PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8;", (error, result) => {
    if (error) throw error;
 
    response.send(result);
});