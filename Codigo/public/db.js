const mysql = require('mysql');
const db = mysql.createConnection ({
    host: "localhost",
    user: "root",
    password: "root_password",
    database: "communibus",
})

db.connect(function(error){
    if(error) throw error
    return console.log("Conexão ok")
})

module.exports = db;


