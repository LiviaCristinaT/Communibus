const mysql = require('mysql');
const db = mysql.createConnection ({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "communibus",
})

db.connect(function(error){
    if(error) throw error
    return console.log("Conexão ok")
})

module.exports = db;


