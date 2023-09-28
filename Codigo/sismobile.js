// const { response } = require("express");

// const app = document.getElementById('root');
// const container = document.createElement('div');
// container.setAttribute('class', 'container');
// app.appendChild(container);

// fetch('http://mobile-l.sitbus.com.br:6060/siumobile-ws-v01/rest/ws/buscarLinhas/retornoJSONListaLinhas')
// console.log(response) 
// .then((response) => response.json())
//     .then((data) => {

//         data.forEach((retornoJSONListaLinha) => {
//             const card = document.createElement('div');
//             card.setAttribute('class', 'card');

//             const h1 = document.createElement('h1');
//             h1.textContent = retornoJSONListaLinha.sgl;

//             const p = document.createElement('p');
//             p.textContent = retornoJSONListaLinha.nom;

//             container.appendChild(card);

//             card.appendChild(h1);
//             card.appendChild(p);
//         });
//     })
//     .catch((error) => {
//         console.error('Erro na API', error);
//     });


// sismobile.js
axios.get('http://127.0.0.1:4001/proxy')
    .then(response => {
        const rawData = response.data;
        const jsonStr = rawData.replace('retornoJSONListaLinhas(', '').slice(0, -1);
        const parsedData = JSON.parse(jsonStr);

        console.log("Tipo de parsedData.linhas:", typeof parsedData.linhas);
        console.log("Valor de parsedData.linhas:", parsedData.linhas);

        let linhas = [];  // Inicialize como um array vazio
        if (Array.isArray(parsedData.linhas) && parsedData.linhas.length > 0) {
            const firstElement = parsedData.linhas[0];
            if (typeof firstElement === 'string') {
                try {
                    const jsonString = firstElement.replace(/'/g, '"');
                    console.log("String JSON completa antes de analisar:", jsonString);
                    linhas = JSON.parse(`[${jsonString}]`);  // Adicione colchetes para torná-lo um array JSON
                } catch (e) {
                    console.error("Erro ao analisar JSON:", e);
                }
            } else {
                linhas = parsedData.linhas;
            }
        }

        if (Array.isArray(linhas)) {  // Verifique se 'linhas' é uma matriz antes de chamar forEach
            exibirLinhasOnibus(linhas);
        }
    })
    .catch(error => {
        console.error(error);
    });
