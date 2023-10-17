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
let markers = []; // Array para armazenar os marcadores

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
var minhaLatitude, minhaLongitude;

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(function (position) {
    minhaLatitude = position.coords.latitude;
    minhaLongitude = position.coords.longitude;
    console.log("Geolocalização:", minhaLatitude, minhaLongitude); // Adicione esta linha
    initMap();
  });
} else {
  console.log("Geolocalização não é suportada por este navegador.");
}

var map;

function initMap() {
  var options = {
    zoom: 16,
    center: { lat: minhaLatitude, lng: minhaLongitude }
  }
  map = new google.maps.Map(document.getElementById('map'), options);

  // Adiciona um marcador para a geolocalização do usuário
  var userLocationMarker = new google.maps.Marker({
    position: { lat: minhaLatitude, lng: minhaLongitude },
    map: map,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10,
      fillColor: "#00F",
      fillOpacity: 0.8,
      strokeWeight: 0
    },
    title: 'Sua localização'
  });
}


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
    } else {
      console.error('Falha ao obter paradas próximas:', parsedData1.errorMessage || 'Erro desconhecido');
    }
  } catch (error) {
    console.error('Erro:', error);
  }
}

async function obterPrevisoes(codigoParada) {
  const response = await axios.get(`http://127.0.0.1:4001/proxy?codigoParada=${codigoParada}`);
  const rawData = response.data.data; // Acesse a propriedade "data" do objeto de resposta para obter a string JSONP
  const jsonStr = rawData.replace('retornoJSONListaLinhas(', '').slice(0, -1);
  const parsedData = JSON.parse(jsonStr);
  return parsedData.previsoes;
}






function exibirParadasProximas(paradas, minhaLatitude, minhaLongitude) {
  const paradasCarrossel = document.getElementById('paradasCarrossel');

  paradas.slice(0, 10).forEach((parada, index) => {
    paradasProximasCodigos.push(parada.cod);
    console.log("Parada:", parada.y, parada.x); // Adicione esta linha
    console.log("Latitude2:", parada.y, "Longitude2:", parada.x);
    const distancia = calcularDistancia(minhaLatitude, minhaLongitude, parada.y, parada.x) / 1000;
    var marker = new google.maps.Marker({
      position: new google.maps.LatLng(parada.y, parada.x),
      map: map,
      title: parada.nome
    });
    markers.push(marker);
    const card = document.createElement('div');
    card.className = 'card';

    const codigo = document.createElement('h3');
    codigo.innerHTML = `Código: ${parada.cod}`;

    const descricao = document.createElement('p');
    descricao.innerHTML = `<strong>Endereço: </strong> ${parada.desc}`;

    const distanciaElemento = document.createElement('p');
    distanciaElemento.innerHTML = `<strong>Distância:</strong> ${distancia.toFixed(2)} km`;

    card.appendChild(descricao);
    card.appendChild(distanciaElemento);

    card.addEventListener('click', async () => {
      console.log('Card clicado!');
      const response2 = await axios.get('http://127.0.0.1:4001/proxy');
      console.log('Resposta da API:', response2);
      const rawData = response2.data;
      const jsonStr = rawData.replace('retornoJSONListaLinhas(', '').slice(0, -1);
      const parsedData2 = JSON.parse(jsonStr);
  
      let linhas = parsedData2.linhas;
      if (Array.isArray(linhas) && linhas.length > 0) {
          const linhasFiltradas = linhas.filter(linha => linha.paradas && linha.paradas.includes(parada.cod));
          const previsoes = await obterPrevisoes(parada.cod);
          exibirLinhasOnibus(linhasFiltradas, previsoes);
          // Abre o modal
          $('#paradaModal').modal('show');
      }
  });
  
    const carouselItem = document.createElement('div');
    carouselItem.className = index === 0 ? 'carousel-item active' : 'carousel-item';

    carouselItem.appendChild(card);
    paradasCarrossel.appendChild(carouselItem);
  });
}

function exibirLinhasOnibus(linhas, previsoes) {
  const linhasDiv = document.getElementById('linhasOnibus');
  linhasDiv.innerHTML = ''; // Limpar as linhas de ônibus exibidas anteriormente
  console.log("Linhas:", linhas); // Log para depuração
  console.log("Previsões:", previsoes); // Log para depuração
  linhas.forEach(linha => {
      const card = document.createElement('div');
      card.className = 'card';

      const codigo = document.createElement('h3');
      codigo.textContent = `Código: ${linha.cod}`;

      const sgl = document.createElement('p');
      sgl.textContent = `Linha: ${linha.sgl}`;

      const nome = document.createElement('p');
      nome.textContent = `Nome: ${linha.nom}`;

      const previsao = previsoes.find(p => p.lin === linha.cod);
      const tempo = document.createElement('p');
      tempo.textContent = previsao ? `Previsão: ${previsao.pre}` : 'Previsão não disponível';

      card.appendChild(codigo);
      card.appendChild(sgl);
      card.appendChild(nome);
      card.appendChild(tempo);

      linhasDiv.appendChild(card);
  });
}




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

$(document).ready(function(){
  $('#carouselExampleControls').on('slide.bs.carousel', function (event) {
      // Remova o destaque de todos os marcadores
      markers.forEach(marker => {
          marker.setIcon(null);
      });

      // Destaque o marcador correspondente ao card atual
      const currentIndex = event.to;
      markers[currentIndex].setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png'); // Você pode usar qualquer ícone personalizado aqui
  });
});

// Chama a função main quando a página é carregada
window.addEventListener('load', main);


