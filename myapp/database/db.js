const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: '106.13.128.116',
    user: 'loginStudy',
    database: 'loginstudy',
    password: 's5yPfmPwRaLGMctx',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection()
    .then(connection => {
        console.log('连接成功');
        connection.release();
    })
    .catch(err => console.error('连接失败:', err));

const query = async (sql, values) => {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query(sql, values);
        return rows;
    } finally {
        connection.release();
    }
};

module.exports = {
    query
};