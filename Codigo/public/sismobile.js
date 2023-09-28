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
let paradasProximasCodigos = [];

async function main() {
  try {
    const position = await getGeolocation();
    const minhaLatitude = position.coords.latitude;
    const minhaLongitude = position.coords.longitude;
    console.log("Latitude1:", minhaLatitude, "Longitude1:", minhaLongitude);

    const response1 = await axios.get(`http://127.0.0.1:4001/proxyParadasProximas?latitude=${minhaLatitude}&longitude=${minhaLongitude}`);
    const parsedData1 = JSON.parse(response1.data.replace('retornoJSON(', '').slice(0, -1));
    console.log('Dados parseados:', parsedData1);

    if (parsedData1.sucesso) {
      const paradas = parsedData1.paradas;
      exibirParadasProximas(paradas, minhaLatitude, minhaLongitude);

      const response2 = await axios.get('http://127.0.0.1:4001/proxy');
      const rawData = response2.data;
      const jsonStr = rawData.replace('retornoJSONListaLinhas(', '').slice(0, -1);
      const parsedData2 = JSON.parse(jsonStr);

      let linhas = parsedData2.linhas;
      if (Array.isArray(linhas) && linhas.length > 0) {
        const linhasFiltradas = linhas.filter(linha => {
          if (linha.paradas) {
            return linha.paradas.some(parada => paradasProximasCodigos.includes(parada));
          }
          return false;
        });

        console.log("Linhas filtradas:", linhasFiltradas);
        exibirLinhasOnibus(linhasFiltradas);
      }
    } else {
      console.error('Falha ao obter paradas próximas:', parsedData1.errorMessage || 'Erro desconhecido');
    }
  } catch (error) {
    console.error('Erro:', error);
  }
}

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

let minhaLatitude, minhaLongitude;

getGeolocation()
  .then(position => {
    minhaLatitude = position.coords.latitude;
    minhaLongitude = position.coords.longitude;
    console.log("Latitude1:", minhaLatitude, "Longitude1:", minhaLongitude);
    return axios.get(`http://127.0.0.1:4001/proxyParadasProximas?latitude=${minhaLatitude}&longitude=${minhaLongitude}`);
  })
  .then(response => {
    const parsedData = JSON.parse(response.data.replace('retornoJSON(', '').slice(0, -1));
    console.log('Dados parseados:', parsedData);
    if (parsedData.sucesso) {
      const paradas = parsedData.paradas;
      exibirParadasProximas(paradas, minhaLatitude, minhaLongitude);
      return axios.get('http://127.0.0.1:4001/proxy');  // Encadeie a chamada aqui
    } else {
      console.error('Falha ao obter paradas próximas:', parsedData.errorMessage || 'Erro desconhecido');
    }
  })
  .then(response => {
    console.log("Dados brutos da API:", response.data);  // Adicione esta linha
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
      // Filtrar linhas com base nas paradas próximas
      const linhasFiltradas = linhas.filter(linha => {
        if (linha.paradas) {  // Verifique se a propriedade 'paradas' existe
          return linha.paradas.some(parada => paradasProximasCodigos.includes(parada));
        }
        return false;  // Se 'paradas' não existir, a linha não será incluída
      });

      console.log("Linhas filtradas:", linhasFiltradas);  // Adicione esta linha


      if (Array.isArray(linhasFiltradas)) {
        exibirLinhasOnibus(linhasFiltradas);
      }
    }
  })

  .catch(error => {
    console.error('Erro:', error);
  });

function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const lat1Rad = lat1 * (Math.PI / 180);
  const lat2Rad = lat2 * (Math.PI / 180);
  const deltaLat = (lat2 - lat1) * (Math.PI / 180);
  const deltaLon = (lon2 - lon1) * (Math.PI / 180);

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distancia = R * c;
  return distancia;
}

function exibirParadasProximas(paradas, minhaLatitude, minhaLongitude) {
  const paradasDiv = document.getElementById('paradasDiv');
  paradas.forEach(parada => {
    paradasProximasCodigos.push(parada.cod);
    console.log("Latitude2:", parada.y, "Longitude2:", parada.x);
    const distancia = calcularDistancia(minhaLatitude, minhaLongitude, parada.y, parada.x) / 1000;
    const card = document.createElement('div');
    card.className = 'card';

    const codigo = document.createElement('h3');
    codigo.textContent = `Código: ${parada.cod}`;

    const descricao = document.createElement('p');
    descricao.textContent = `Descrição: ${parada.desc}`;

    const distanciaElemento = document.createElement('p');
    distanciaElemento.textContent = `Distância: ${distancia.toFixed(2)} km`;

    card.appendChild(codigo);
    card.appendChild(descricao);
    card.appendChild(distanciaElemento);

    paradasDiv.appendChild(card);
  });
}

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


