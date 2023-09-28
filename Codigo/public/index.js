const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');

const app = express();
const port = 4001;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/proxy', async (req, res) => {
  try {
    const response = await axios.get('http://mobile-l.sitbus.com.br:6060/siumobile-ws-v01/rest/ws/buscarLinhas/retornoJSONListaLinhas');
    res.json(response.data);
  } catch (error) {
    console.error('Erro ao fazer a requisição:', error);
    res.status(500).send('Erro interno');
  }
});

app.get('/proxyParadasProximas', async (req, res) => {
    const { latitude, longitude } = req.query;
    try {
        const response = await axios.get(`http://mobile-l.sitbus.com.br:6060/siumobile-ws-v01/rest/ws/buscarParadasProximas/${longitude}/${latitude}/0/retornoJSON`);
        res.json(response.data);
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error);
        res.status(500).send('Erro interno');
    }
});

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

app.post("/usuario/", (req, res) => {
    const nome = req.body.nome;
    const email = req.body.email;
    const senha = req.body.senha;
    const confirmasenha = req.body.confirmasenha;

    if (senha !== confirmasenha) {
        return res.status(400).send('As senhas não coincidem.');
    }

    const q = "INSERT INTO usuario (`nome`, `email`, `senha`, `confirmasenha`) VALUES (?, ?, ?, ?)";
    const values = [nome, email, senha, confirmasenha];

    db.query(q, values, (err, data) => {
        if (err) {
            console.error('Erro ao consultar o banco de dados');
            return res.status(500).send('Erro interno');
        } else {
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


