const wrapper = document.querySelector(".wrapper"),
editableInput = wrapper.querySelector(".editable"),
readonlyInput = wrapper.querySelector(".readonly"),
placeholder = wrapper.querySelector(".placeholder"),
counter = wrapper.querySelector(".counter"),
button = wrapper.querySelector("button");

editableInput.onfocus = ()=>{
  placeholder.style.color = "#c5ccd3";
}
editableInput.onblur = ()=>{
  placeholder.style.color = "#98a5b1";
}

editableInput.onkeyup = (e)=>{
  let element = e.target;
  validated(element);
}
editableInput.onkeypress = (e)=>{
  let element = e.target;
  validated(element);
  placeholder.style.display = "none";
}

function validated(element){
  let text;
  let maxLength = 100;
  let currentlength = element.innerText.length;

  if(currentlength <= 0){
    placeholder.style.display = "block";
    counter.style.display = "none";
    button.classList.remove("active");
  }else{
    placeholder.style.display = "none";
    counter.style.display = "block";
    button.classList.add("active");
  }

  counter.innerText = maxLength - currentlength;

  if(currentlength > maxLength){
    let overText = element.innerText.substr(maxLength); //extracting over texts
    overText = `<span class="highlight">${overText}</span>`; //creating new span and passing over texts
    text = element.innerText.substr(0, maxLength) + overText; //passing overText value in textTag variable
    readonlyInput.style.zIndex = "1";
    counter.style.color = "#e0245e";
    button.classList.remove("active");
  }else{
    readonlyInput.style.zIndex = "-1";
    counter.style.color = "#333";
  }
  readonlyInput.innerHTML = text; //replacing innerHTML of readonly div with textTag value
}

document.addEventListener('DOMContentLoaded', () =>{
    const tweetsContainer = document.getElementById('input-box');

    function postarTweet(){
        const tweetText = document.getElementById('tweet-area').value;
       
        const T = new Twit({
        consumer_key: 'm8kZ9aAXPSLBXRiW69zleJRvJ',
        consumer_secret: 'ZCdagS82bUcU4cyL0jAbH9CMkSSypFJRkXZHOBUJknPs84n7DA',
        access_token: '1481772103582076931-y2CLg6owQddbTkF50X0BnnXAjNQK05',
        access_token_secret: 't22Y608TWV7Rum2AWpOvpY6deMt6Q9ofAkk7LZSbuoPgI',
    });
    
   T.post('statuses/update', { status: tweetText }, (err, data, response) =>{
    if(err){
        console.error('Erro ao postar tweet: ', err);
    }
    else{
        console.log('Tweet postado: ', data);

        const tweetElement = document.createElement('div');
        tweetElement.innerHTML = `<p>${tweetText}</p>`;
        tweetsContainer.appendChild(tweetElement);
    }
   });
}
});
