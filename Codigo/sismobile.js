const { response } = require("express");

const app = document.getElementById('root');
const container = document.createElement('div');
container.setAttribute('class', 'container');
app.appendChild(container);

fetch('http://mobile-l.sitbus.com.br:6060/siumobile-ws-v01/rest/ws/buscarLinhas/retornoJSONListaLinhas')
console.log(response) 
.then((response) => response.json())
    .then((data) => {

        data.forEach((retornoJSONListaLinha) => {
            const card = document.createElement('div');
            card.setAttribute('class', 'card');

            const h1 = document.createElement('h1');
            h1.textContent = retornoJSONListaLinha.sgl;

            const p = document.createElement('p');
            p.textContent = retornoJSONListaLinha.nom;

            container.appendChild(card);

            card.appendChild(h1);
            card.appendChild(p);
        });
    })
    .catch((error) => {
        console.error('Erro na API', error);
    });
