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
// sismobile.js
// sismobile.js
//const axios = require('axios');
// Chamada de API para obter linhas de ônibus
function getGeolocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, (error) => {
      if (error.code === 1) {
        alert('Por favor, permita o acesso à sua localização para encontrar paradas de ônibus próximas.');
      }
      reject(error);
    });
  });
}

getGeolocation()
  .then(position => {
    const { latitude, longitude } = position.coords;
    return axios.get(`http://127.0.0.1:4001/proxyParadasProximas?latitude=${latitude}&longitude=${longitude}`);
  })
  .then(response => {
    // Tentativa de parsear a resposta
    const parsedData = JSON.parse(response.data.replace('retornoJSON(', '').slice(0, -1));
    console.log('Dados parseados:', parsedData);  // Log de depuração

    if (parsedData.sucesso) {
      const paradas = parsedData.paradas;
      exibirParadasProximas(paradas);
    } else {
      console.error('Falha ao obter paradas próximas: ', parsedData.errorMessage || 'Erro desconhecido');
    }
  })
  .catch(error => {
    console.error('Erro:', error);
  });


// Função para exibir linhas de ônibus
function exibirLinhasOnibus(linhas) {
  const linhasDiv = document.getElementById('linhasDiv');
  linhas.forEach(linha => {
    const card = document.createElement('div');
    card.className = 'card';

    const codigo = document.createElement('h3');
    codigo.textContent = `Código: ${linha.cod}`;

    const sgl = document.createElement('p');
    sgl.textContent = `Linha: ${linha.sgl}`;

    const nome = document.createElement('p');
    nome.textContent = `Nome: ${linha.nom}`;

    card.appendChild(codigo);
    card.appendChild(sgl);
    card.appendChild(nome);

    linhasDiv.appendChild(card);
  });
}

// Função esqueleto para exibir paradas próximas
// Função para exibir paradas próximas
function exibirParadasProximas(paradas) {
  const paradasDiv = document.getElementById('paradasDiv');
  paradas.forEach(parada => {
    const card = document.createElement('div');
    card.className = 'card';

    const codigo = document.createElement('h3');
    codigo.textContent = `Código: ${parada.cod}`;

    const descricao = document.createElement('p');
    descricao.textContent = `Descrição: ${parada.desc}`;

    const coordenadas = document.createElement('p');
    coordenadas.textContent = `Coordenadas: (${parada.x}, ${parada.y})`;

    card.appendChild(codigo);
    card.appendChild(descricao);
    card.appendChild(coordenadas);

    paradasDiv.appendChild(card);
  });
}


// Chamada para obter linhas de ônibus
axios.get('http://127.0.0.1:4001/proxy')
  .then(response => {
    const rawData = response.data;
    const jsonStr = rawData.replace('retornoJSONListaLinhas(', '').slice(0, -1);
    const parsedData = JSON.parse(jsonStr);

    let linhas = parsedData.linhas;
    if (Array.isArray(linhas) && linhas.length > 0) {
      const firstElement = linhas[0];
      if (typeof firstElement === 'string') {
        try {
          const jsonString = '[' + firstElement.replace(/'/g, '"') + ']';
          linhas = JSON.parse(jsonString);
        } catch (e) {
          console.error('Erro ao analisar JSON:', e);
        }
      }
    }

    if (Array.isArray(linhas)) {
      exibirLinhasOnibus(linhas);
    }
  })
  .catch(error => {
    console.error(error);
  });




// Chamada de API para obter paradas próximas (adicione sua lógica aqui)
// axios.get('URL_PARA_OBTER_PARADAS_PROXIMAS')
//     .then(response => {
//         // Implemente a lógica aqui
//     })
//     .catch(error => {
//         console.error(error);
//     });
