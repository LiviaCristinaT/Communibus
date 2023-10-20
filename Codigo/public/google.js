function handleCredentialResponse(response) {
    const data = jwt_decode(response.credential)
    console.log(data)
    
    window.location.href = '/index.html';
}
window.onload = function () {
    google.accounts.id.initialize({
        client_id: "711625425532-epfmcjvpc9295c6gtb4grl385im20muk.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });
    google.accounts.id.renderButton(
        document.getElementById("botaoGoogle"),
        { theme: "filled_black", 
        size: "medium",
        type:"standard",
        shape:"pill",
        text:"signin_with",
        logo_alignment:"left" }  
    );
}