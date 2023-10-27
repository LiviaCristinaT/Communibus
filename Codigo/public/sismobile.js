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
let markers = [];
let minhaLatitude, minhaLongitude;
let paradasProximasCodigos = []; // Defina no escopo global

function getGeolocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(function (position) {
    minhaLatitude = position.coords.latitude;
    minhaLongitude = position.coords.longitude;
    initMap(); // Chame initMap somente depois de obter as coordenadas
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

async function main() {
  try {
    const position = await getGeolocation();
    const minhaLatitude = position.coords.latitude;
    const minhaLongitude = position.coords.longitude;

    const response1 = await axios.get(`http://127.0.0.1:4001/proxyParadasProximas?latitude=${minhaLatitude}&longitude=${minhaLongitude}`);
    const parsedData1 = JSON.parse(response1.data.replace('retornoJSON(', '').slice(0, -1));

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

function obterPrevisoes(codParada) {
  axios.get(`http://mobile-l.sitbus.com.br:6060/siumobile-ws-v01/rest/ws/buscarPrevisoes/${codParada}/0/retornoJSON`)
    .then(response => {
      const data = JSON.parse(response.data.replace('retornoJSON(', '').slice(0, -1));
      exibirPrevisoes(data);
    })
    .catch(error => {
      console.error("Erro ao obter previsões:", error);
    });
}



window.addEventListener('load', main);



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
      window.location.href = `/parada.html?codParada=${parada.cod}`; // Passa o código da parada como parâmetro na URL
    });
    

    const carouselItem = document.createElement('div');
    carouselItem.className = index === 0 ? 'carousel-item active' : 'carousel-item';

    carouselItem.appendChild(card);
    paradasCarrossel.appendChild(carouselItem);
  });
}

function exibirLinhasOnibus(linhas) {
  const container = document.getElementById('linhas-container');
  container.innerHTML = ''; // Limpar conteúdo anterior
  linhas.forEach(linha => {
    const linhaElement = document.createElement('div');
    linhaElement.textContent = `${linha.num_linha} - ${linha.descricao}`;
    container.appendChild(linhaElement);
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


$(document).ready(function () {
  $('#carouselExampleControls').on('slide.bs.carousel', function (event) {
    // Remova o destaque de todos os marcadores
    markers.forEach(marker => {
      marker.setIcon(null);
    });

    // Verifique se o marcador existe antes de tentar acessá-lo
    const currentIndex = event.to;
    if (markers[currentIndex]) {
      markers[currentIndex].setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
    }
  });
});

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

async function buscarLinhasDaParada(codParada) {
  try {
    const resposta = await fetch(`http://127.0.0.1:4001/siumobile-ws-v01/rest/ws/retornaLinhasQueAtendemParada/${codParada}/0/retornoJSON`);
    const dados = await resposta.json();
    if (dados.sucesso) {
      exibirLinhasOnibus(dados.linhas);
    } else {
      console.error('Não foi possível obter as linhas de ônibus para esta parada');
    }
  } catch (erro) {
    console.error('Erro ao buscar linhas de ônibus:', erro);
  }
}
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const codParada = urlParams.get('codParada');
  if (codParada) {
    buscarLinhasDaParada(codParada);
  } else {
    console.error('Código da parada não fornecido');
  }
});


// Chama a função main quando a página é carregada
window.addEventListener('load', main);


