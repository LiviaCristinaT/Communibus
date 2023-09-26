const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db')

const app = express();
const port = 4000;

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function(req,res){
    res.sendFile(__dirname + "/public/login.html");
})

app.post("/", function(req,res){
    var email = req.body.email;
    var senha = req.body.senha;
    db.query("SELECT * FROM usuario WHERE email = ? AND senha = ?", [email,senha], function(error, results, fields){
        if(error){
            console.error('Erro ao consultar o banco de dados');
            res.status(500).send('Erro interno');
            return;
        }
        else if(results && results.length > 0){
            res.redirect("/index.html");
        } 
        else{ res.redirect("/");
    }
    res.end();
})
})


app.post("/usuario/", (req, res) =>{
    const q = "INSERT INTO usuario (`nome`, `email`, `senha`, `confirmasenha`) VALUES (?, ?, ?, ?)";
    const values = [req.body.nome, req.body.email, req.body.senha, req.body.confirmasenha];

    db.query(q, values, (err, data) =>{
        if(err){
            console.error('Erro ao consultar o banco de dados');
            res.status(500).send('Erro interno');
            return;
        }
        else{
            res.redirect("/index.html");
        }
    });
});

app.use(express.static(__dirname + '/public'));

app.get("/index.html", function(req,res){
    res.sendFile(__dirname + "/index.html");
})

app.listen(port, () => {
    console.log(`Servidor na porta ${port}`)
});
