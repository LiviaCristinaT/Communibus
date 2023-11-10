const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const cors = require('cors');
const Twit = require('twit');
const { fa } = require('@fortawesome/free-brands-svg-icons');


const app = express();
const PORT = 4001;

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
  

app.use(session({
    secret: '12345',
    resave: true,
    saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/proxyLinhasDaParada', cors(), async (req, res) => {
    const codParada = req.query.codParada;
    if (!codParada) {
        return res.status(400).send('codParada é obrigatório');
    }

    try {
        const response = await axios.get(`http://mobile-l.sitbus.com.br:6060/siumobile-ws-v01/rest/ws/retornaLinhasQueAtendemParada/${codParada}/0/retornoJSON`);
        res.json(response.data);
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error);
        res.status(500).send('Erro interno');
    }
});


app.get('/parada/:codParada', async (req, res) => {
    const codParada = req.params.codParada;

    try {
        // Solicitando previsões de uma Parada
        const response = await axios.get(`http://mobile-l.sitbus.com.br:6060/siumobile-ws-v01/rest/ws/buscarPrevisoes/${codParada}/0/retornoJSON`);
        
        if (response.data.sucesso) {
            const previsoes = response.data.previsoes;
            // Renderizar a página com as previsões
            res.render('parada', { previsoes });
        } else {
            res.status(500).send('Erro ao buscar previsões.');
        }
    } catch (error) {
        res.status(500).send('Erro ao comunicar com a API.');
    }
});

app.get('/proxy', async (req, res) => {
    try {
        const response = await axios.get('http://mobile-l.sitbus.com.br:6060/siumobile-ws-v01/rest/ws/buscarLinhas/retornoJSONListaLinhas');
        res.json(response.data);
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error);
        res.status(500).send('Erro interno');
    }
});
app.get('/proxyPrevisoesPorCodigo', async (req, res) => {
    const codParada = req.query.codParada;
    if (!codParada) {
        return res.status(400).send('codParada é obrigatório');
    }

    try {
        const response = await axios.get(`http://mobile-l.sitbus.com.br:6060/siumobile-ws-v01/rest/ws/buscarPrevisoes/${codParada}/0/retornoJSON`);
        res.send(response.data);
    } catch (error) {
        res.status(500).send('Erro ao buscar previsões');
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

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/public/login.html");
});
//Efetuando o login com email e senha
app.post("/", function (req, res) {
    const email = req.body.email;
    const senha = req.body.senha;
    db.query("SELECT * FROM usuario WHERE email = ? AND senha = ?", [email, senha], function (error, results, fields) {
        if (error) {
            console.error('Erro ao consultar o banco de dados', error);
            res.status(500).send('Erro interno');
            return;
        }
        if (results && results.length > 0) {
            res.redirect("/index.html");
        } else {
            res.redirect("/");
        }
    });
});
//Cadastro de usuarios pelo formulário padrão
app.post("/usuario", (req, res) => {
    const { nome, email, senha, confirmasenha } = req.body;

    // Verificar se senha e confirmasenha coincidem
    if (senha !== confirmasenha) {
        return res.status(400).send('As senhas não coincidem.');
    }

    const q = "INSERT INTO usuario (`nome`, `email`, `senha`, `confirmasenha`) VALUES (?, ?, ?, ?)";
    const values = [nome, email, senha, confirmasenha];

    db.query(q, values, (err, data) => {
        if (err) {
            console.error('Erro ao consultar o banco de dados', err);
            res.status(500).send('Erro interno');
            return;
        }
        res.redirect("/index.html");
    });
});

//Autenticação e login com Google
app.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }));

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/index.html');
});

//Autenticação e login com Twitter
passport.serializeUser((user, done) => {
    done(null, user.email);
});

passport.deserializeUser((id, done) => {
    db.query('SELECT * FROM usuario WHERE email = ?', [id], (err, results) => {
        if (err) {
            return done(err, null);
        }
        if (results.length === 0) {
            return done(null, null);
        }
        return done(null, results[0]);
    });
});

passport.use(
    new TwitterStrategy({
        consumerKey: 'm8kZ9aAXPSLBXRiW69zleJRvJ',
        consumerSecret: 'ZCdagS82bUcU4cyL0jAbH9CMkSSypFJRkXZHOBUJknPs84n7DA',
        callbackURL: 'http://localhost:4001/auth/twitter/callback',
    },
    (token, tokenSecret, profile, done) => {
        db.query('SELECT * FROM usuario WHERE email = ?', [profile.username], (err, results) => {
            if (err) {
                return done(err, null);
            }

            if (results.length > 0) {
                const user = results[0];
                return done(null, user);
            } else {
                const userData = {
                    nome: profile.displayName,
                    email: profile.username,
                };

                db.query('INSERT INTO usuario SET ?', userData, (err, result) => {
                    if (err) {
                        return done(err, null);
                    }

                    userData.username = result.insertUser;

                    const twitterIcon = fa.faTwitter;
                    userData.twitterIcon = twitterIcon;

                    return done(null, userData);
                });
            }
        });
    })
);

app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/twitter/callback', passport.authenticate('twitter', {
    successRedirect: '/index.html',
    failureRedirect: '/login.html',
}), (req, res) =>{
    const user = req.user;

    res.send(`
    <i class= "fab fa-twitter></i>
    <span>${user.nome}</span>
    <img src="${user.twitterIcon}" alt="Twitter Icon`);
});


app.use(express.static(__dirname + '/public'));

app.get("/index.html", (req, res) => {
    res.sendFile(__dirname + "/index.html");
})


app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
