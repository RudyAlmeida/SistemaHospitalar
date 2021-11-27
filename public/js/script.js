// API de Login do google incluindo autenticação e Logout
function start() {
    gapi.load('auth2', function() {
        auth2 = gapi.auth2.init({
            client_id: '113301151213-bkaouvjjjasi17hvu163054palrsju6k.apps.googleusercontent.com'

        });
    });
}

function onSignIn(googleUser) {
    let profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
    let nome = profile.getName()
    let img = profile.getImageUrl()
    let logImg = document.getElementById('loginImg')
    console.log(logImg)
    logImg.src = img
    document.getElementById('dropText').innerText = nome
    document.getElementById('loginBtn').removeAttribute("data-onsuccess")
    document.getElementById('loginBtn').setAttribute("onclick", "signOut()")
    console.log(document.getElementById('loginBtn'))
    let userData = {}
    userData.nome = profile.getName();
    userData.mail = profile.getEmail()
    userData.img = profile.getImageUrl()
    userData.id = profile.getId()
        // Salvando o login no Local Storage
    localStorage.setItem('userData', JSON.stringify(userData))
    console.log(localStorage)
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function() {
        document.getElementById('dropText').innerText = "Cadastre-se / Login"
        let logImg = document.getElementById('loginImg')
        logImg.src = "imagens/person-circle.svg"
        localStorage.clear();
        console.log('User signed out.');
        console.log(localStorage)
    });
}
// Recuperando o login do Local Storage
function getUser() {
    let userData = JSON.parse(localStorage.getItem("userData"));
    if (userData != null) {
        let logImg = document.getElementById('loginImg')
        let img = userData.img
        logImg.src = img
        let nome = userData.nome
        document.getElementById('dropText').innerText = nome
        $("#contato").val(userData.nome)
    }
}

function abrirModal() {
    var modal = document.getElementById("modalLogin");
    var elementoBootstrap = new bootstrap.Modal(modal);
    elementoBootstrap.show();
}

function fecharModal() {
    $("#modalLogin").modal("hide");
}