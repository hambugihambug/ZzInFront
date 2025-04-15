const db = require('mysql2');

const conn = db.createConnection({
    host: '203.231.146.220',
    port: 3306,
    user: '202506_cu',
    password: '202506_cu',
    database: '202506_cu',
});

module.exports = conn;
