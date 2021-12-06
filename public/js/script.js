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
    /*  console.log('ID: ' + profile.getId()); 
     console.log('Name: ' + profile.getName());
     console.log('Image URL: ' + profile.getImageUrl());
     console.log('Email: ' + profile.getEmail());  */
    let nome = profile.getName()
    let img = profile.getImageUrl()
    let logImg = document.getElementById('loginImg')
    logImg.src = img
    document.getElementById('dropText').innerText = nome
    document.getElementById('loginBtn').removeAttribute("data-onsuccess")
    document.getElementById('loginBtn').setAttribute("onclick", "signOut()")
    let userData = {}
    userData.nome = profile.getName();
    userData.email = profile.getEmail()
    userData.img = profile.getImageUrl()
    userData.idGoogle = profile.getId()
    userData.senha = null

    // Salvando o login no Local Storage
    localStorage.setItem('userData', JSON.stringify(userData))

    fetch('/salvarGoogle', {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                obj: userData
            })
        }).then(res => {
            return res.json()
        })
        .then(data => console.log(data))
        .catch(error => console.log('ERROR'))

}

function signUser() {
    let userData = {}
    userData.email = document.getElementById('signEmail').value
    userData.password = document.getElementById('signPassword').value
    fetch('/logarUser', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            obj: userData
        })
    }).then(res => {
        return res.json()
    }).then(data => {
        console.log(data)
        if (data.nome != undefined) {
            document.getElementById('dropText').innerText = data.nome
            let userData = {}
            userData.id = data._id
            userData.nome = data.nome
            userData.email = data.email
            userData.img = data.img
            userData.idGoogle = data.idGoogle
            userData.admin = data.admin
                // Salvando o login no Local Storage
            localStorage.setItem('userData', JSON.stringify(userData))
            if (userData.admin === true) {
                let a = document.createElement("a");
                a.setAttribute("href", "/admin/" /* + userData.id */ );
                a.setAttribute('class', 'nav-link')
                a.innerText = 'Administração'
                let li = document.createElement("li");
                let ul = document.getElementById('navItens')
                li.setAttribute('class', 'nav-item')
                li.setAttribute('id', 'liAdmin')
                li.appendChild(a)
                ul.appendChild(li)
            }

            fecharModal();

            if (data.img != undefined) {
                let logImg = document.getElementById('loginImg')
                logImg.src = img
            } else {
                let logImg = document.getElementById('loginImg')
                logImg.src = "/img/person-circle.svg"
            }

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
        document.getElementById('liAdmin').innerHTML = '';

        fetch('/logoutUser', {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            }
        }).then(res => {
            return res.json()
        }).then(data => {
            console.log(data)
        }).catch(error => console.log('ERROR'))

    });
    document.getElementById('dropText').innerText = "Cadastre-se / Login"
    let logImg = document.getElementById('loginImg')
    logImg.src = "img/person-circle.svg"
    localStorage.clear();
    document.getElementById('liAdmin').innerHTML = '';
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
        if (userData.admin === true) {
            let a = document.createElement("a");
            a.setAttribute("href", "/admin/" /* + userData.id */ );
            a.setAttribute('class', 'nav-link')
            a.innerText = 'Administração'
            let li = document.createElement("li");
            let ul = document.getElementById('navItens')
            li.setAttribute('class', 'nav-item')
            li.setAttribute('id', 'liAdmin')
            li.appendChild(a)
            ul.appendChild(li)
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
//Modal Pagina de Busca
function abrirModal2() {
    var modal2 = document.getElementById('ModalBusca');
    var bts = bootstrap.Modal.getOrCreateInstance(modal2);
    $('#ModalBusca').modal("handleUpdate")
    bts.show()
}

$(document).ready(function() {
    $(document).on('click', '.MedicoModal', function() {
        var medicoid = $(this).attr('id')
        document.getElementById('modalImg').src = ""
        fetch('/modal', {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                obj: medicoid
            })
        }).then(res => {
            /*  const response = res.json()
             console.log(response.Object) */
            return res.json()
        }).then(data => {

            document.getElementById('modalImg').src = data.foto
            document.getElementById('modalNome').innerText = 'Dr. ' + data.nome
            document.getElementById('modalEstado').innerText = data.estado
            document.getElementById('modalEmail').innerText = data.email
            document.getElementById('modalNascimento').innerText = data.dataNascimento
            document.getElementById('modalSituacao').innerText = data.situacao
            document.getElementById('modalEspecialidades').innerText = data.especialidades

            abrirModal2()
        })

    })
})

function fecharModal2() {
    document.getElementById('modalImg').src = ""
    $('#ModalBusca').modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove()
}