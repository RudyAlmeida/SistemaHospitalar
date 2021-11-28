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
    userData.email = profile.getEmail()
    userData.img = profile.getImageUrl()
    userData.idGoogle = profile.getId()
    userData.senha = null

    // Salvando o login no Local Storage
    localStorage.setItem('userData', JSON.stringify(userData))
    console.log(localStorage)

    fetch('/salvarGoogle', {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                obj: userData
            })
        }).then(res => {
            const response = res.json()
            console.log(response)
            return res.json()
        })
        .then(data => console.log(data))
        .catch(error => console.log('ERROR'))

}

function signUser() {
    let userData = {}
    let responseUser = {}
    userData.email = document.getElementById('signEmail').value
    userData.password = document.getElementById('signPassword').value
    console.log(userData)
    fetch('/logarUser', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            obj: userData
        })
    }).then(res => {
        /*  const response = res.json()
         console.log(response.Object) */
        return res.json()
    }).then(data => {
        console.log(data)
        if (data.nome != undefined) {
            console.log(data.img)
            document.getElementById('dropText').innerText = data.nome
            let userData = {}
            userData.nome = data.nome
            userData.email = data.email
            userData.img = data.img
            userData.idGoogle = data.idGoogle
                // Salvando o login no Local Storage
            localStorage.setItem('userData', JSON.stringify(userData))
            console.log(localStorage)
            if (data.img != undefined) {
                let logImg = document.getElementById('loginImg')
                console.log(logImg)
                logImg.src = img
            } else {
                let logImg = document.getElementById('loginImg')
                logImg.src = "/img/person-circle.svg"
            }
            fecharModal();
        }

    }).catch(error => console.log('ERROR'))




}


function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function() {
        document.getElementById('dropText').innerText = "Cadastre-se / Login"
        let logImg = document.getElementById('loginImg')
        logImg.src = "img/person-circle.svg"
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
        if (img != undefined) {
            logImg.src = img
        } else {
            logImg.src = "/img/person-circle.svg"
        }
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