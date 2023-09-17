const mysql = require('mysql2');
require('dotenv').config();

// createPool : 다중 연결을 관리함.
// const pool = mysql.createPool({ 
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     database: process.env.DB_DATABASE,
//     password: process.env.DB_PASSWORD,
//     port: process.env.DB_PORT   
// });

const db = mysql.createConnection({ 
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

db.connect((err) => {
    if(err) throw err;
    console.log('MySQL db 연결.');
});

module.exports = db;