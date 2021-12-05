const client = require('./conn')
const dbo = client.db('SistemaHospitalar')
const express = require('express')
const exphbs = require('express-handlebars')
const app = express()
const port = process.env.PORT || 3000
const path = require('path')
const { uploadFile } = require('./s3')
const multer = require('multer')
require("dotenv").config();
const fs = require('fs')
const objectId = require('mongodb').ObjectId
const methodOverRide = require('method-override') // Estudado em https://philipm.at/2017/method-override_in_expressjs.html
const { LocalStorage } = require('node-localstorage')
var localStorage = new LocalStorage('./scratch');


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function(req, file, cb) {

        const extensaoArquivo = file.originalname.split('.')[1];
        const novoNomeArquivo = require('crypto')
            .randomBytes(64)
            .toString('hex');
        cb(null, `${novoNomeArquivo}.${extensaoArquivo}`)
    }
});

const checkAdmin = function(req, res, next) {
    const user = JSON.parse(localStorage.getItem('Usuario'))
    if (user == null) {
        res.redirect('/')
    } else if (user.admin == true) {
        return next()
    } else {
        res.redirect('/')
    }
}

const upload = multer({ storage });


const hbs = exphbs.create({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: ('/views/partials/')
})
app.engine('handlebars', hbs.engine)
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars')

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static(__dirname + '/public'))
app.use(methodOverRide('_method'))

app.get('/', (req, res) => {
    res.render('./index', { style: 'index.css' })
})


// CRUD de ESPECIALIDADES

app.get('/cadEsp', checkAdmin, (req, res) => {
    dbo.collection('Especialidades').find({}).collation({ locale: "pt" }).sort({ nome: 1 }).toArray((erro, especialidades) => {
        if (erro) throw erro
        res.render('cadEspecialidades', { especialidades })
    })
})

app.post('/addEsp', checkAdmin, (req, res) => {
    const obj = {
        nome: req.body.especialidade
    }
    dbo.collection('Especialidades').insertOne(obj, (erro, add) => {
        res.redirect('/cadEsp')
    })
})

app.get('/cadEsp/editar/:id', checkAdmin, (req, res) => {
    let id = req.params.id
    let objID = new objectId(id)

    dbo.collection('Especialidades').findOne({ _id: objID }, (erro, esp) => {
        if (erro) throw erro
        let espID = esp._id
        let espNome = esp.nome
        res.render('editarEspecialidade', { espNome, espID })
    })

})

app.post('/atualizarEsp/:id', checkAdmin, (req, res) => {
    let id = req.params.id
    let objID = new objectId(id)
    let novoNome = req.body.especialidade

    async function atualizar() {
        await dbo.collection('Especialidades').findOneAndReplace({ _id: objID }, { nome: novoNome })
        res.redirect('/cadEsp')
    }
    atualizar()
})

app.get('/cadEsp/excluir/:id', checkAdmin, (req, res) => {
    let id = req.params.id
    let objID = new objectId(id)

    async function atualizar() {
        await dbo.collection('Especialidades').deleteOne({ _id: objID })
        res.redirect('/cadEsp')
    }
    atualizar()
})


app.get('/cadUsuario', (req, res) => {
    res.render('cadastroUsuario', { style: "usuario.css" })
})


//rota de cadastro de médicos

app.get('/cadMedicos', checkAdmin, (req, res) => {

    let action = "Salvar"

    dbo.collection("Especialidades").find({}).toArray((erro, especialidades) => {
        if (erro) throw erro
        res.render('cadastroMedicos', { especialidades, action })
    })
})

//post do cadastro

app.post('/addMedicos', checkAdmin, upload.single('imagem'), async(req, res) => {

    const file = req.file
    const resultado = await uploadFile(file)
    const obj = {
        nome: req.body.nome,
        endereco: req.body.endereco,
        telefone: req.body.telefone,
        dataNascimento: req.body.dataNascimento,
        estado: req.body.estado,
        email: req.body.email,
        situacao: req.body.situacao,
        especialidades: req.body.especialidades,
        foto: resultado.Location
    }

    if (req.body.idInp == "") {
        dbo.collection('infoMedicos').insertOne(obj, (erro, resultado) => {
            if (erro) throw erro
            res.redirect("/medico/listagem")
        })


    } else {

        const idInp = req.body.idInp
        const objMed = new objectId(idInp)
        dbo.collection("infoMedicos").updateOne({ _id: objMed }, { $set: obj }, { upsert: true }, (erro, resultado) => {
                if (erro) throw erro
                res.redirect('/medico/listagem')
            }


        )


    }

})

//listagem de médicos

app.get('/medico/listagem', checkAdmin, (req, res) => {
    dbo.collection('infoMedicos').find({}).toArray((erro, resultado) => {
        if (erro) throw erro
        res.render('listagemMedicos', { resultado })
    })
})

//deletar médicos

app.get('/medico/deletar/:_id', checkAdmin, (req, res) => {

    const idMed = req.params._id
    const objMed = new objectId(idMed)
    dbo.collection('infoMedicos').deleteOne({ _id: objMed }, (erro, resultado) => {

        if (erro) throw erro
        res.redirect('/medico/listagem')

        dbo.collection("Especialidades").find({}).toArray((erro, resultado) => {
            if (erro) throw erro
            res.render('cadastroMedicos', { resultado })
        })


    })

})

//post do cadastro
app.post('/addMedicos', checkAdmin, (req, res) => {
        const obj = {
            nome: req.body.nome,
            endereco: req.body.endereco,
            telefone: req.body.telefone,
            dataNascimento: req.body.datanascimento,
            estado: req.body.estado,
            email: req.body.email,
            situacao: req.body.situacao,
            especialidades: req.body.especialidades

        }
        dbo.collection('infoMedicos').insertOne(obj, (erro, resultado) => {
            if (erro) throw erro
            res.redirect("/home")
        })
    })
    //cadastro de usuario
app.post('/NovoUsuario', (req, res) => {
    let admin = Boolean
    if (req.body.admin == 'true') {
        admin = true
    } else {
        admin = false
    }
    const Nusuario = {
        nome: req.body.nome,
        email: req.body.email,
        senha: req.body.senha,
        admin: admin
    }
    dbo.collection('Usuarios').insertOne(Nusuario, (err, result) => {
        if (err) throw err
        res.redirect('/cadUsuario')
    })
})

app.post('/salvarGoogle', (req, res) => {
    obj = req.body.obj
    dbo.collection('Usuarios').findOne({ idGoogle: obj.idGoogle }, (erro, resultado) => {

        if (resultado === null) {
            dbo.collection('Usuarios').insertOne(obj, (err, result) => {
                if (err) throw err
                localStorage.setItem('Usuario', JSON.stringify(obj))
            })
        } else {
            localStorage.setItem('Usuario', JSON.stringify(resultado))
        }
    })

})

app.post('/logarUser', (req, res) => {
    obj = req.body.obj
    console.log(obj)
    let usuario = []

    dbo.collection('Usuarios').find({}).toArray((erro, resultado) => {
        const user = {
            email: obj.email,
            password: obj.password
        }

        if (erro) { throw erro }

        resultado.forEach(element => {
            if (element['email'] == user['email'] && element['senha'] == user['password']) {
                usuario = element
                localStorage.setItem('Usuario', JSON.stringify(element))
            }
        })
        res.send(JSON.stringify(usuario))

    })

})

app.post('/logoutUser', (req, res) => {
        localStorage.clear()
        res.send(JSON.stringify('limpo'))
    })
    // BUSCA de MÉDICOS
app.get('/busca', (req, res) => {
    res.render('buscaMedico')
})

app.put('/busca', (req, res) => {
    let tipoBusca = req.body.tipoBusca
    let termo = req.body.termo

    dbo.collection('infoMedicos').find({
        [tipoBusca]: { $regex: `(?i)${termo}` }
    }).toArray((erro, infoMedico) => {
        let semResposta = false
        if (erro) throw erro
        if (infoMedico.length == 0) semResposta = true
        res.render('buscaMedico', { infoMedico, semResposta, style: 'index.css' })
    })
})

app.post('/modal', (req, res) => {
    obj = req.body.obj

    dbo.collection('infoMedicos').findOne({ _id: objectId(obj) }, (erro, resultado) => {

        res.send(JSON.stringify(resultado))

    })

})

app.get('/admin/', checkAdmin, (req, res) => {

    res.render('admin')

})


app.get('/admin/cadUser/', checkAdmin, (req, res) => {

    dbo.collection("Usuarios").find({ admin: true }).toArray((erro, result) => {
        if (erro) throw erro
        res.render('cadUser', { result })
    })
})

//editar médicos

app.get('/medico/editar/:_id', checkAdmin, (req, res) => {

    let action = "atualizar"

    const idMed = req.params._id
    const objMed = new objectId(idMed)
    console.log(objMed)

    dbo.collection('infoMedicos').findOne({ _id: objMed }, (erro, resultado) => {
        if (erro) throw erro
            // arquivo da página
        dbo.collection('Especialidades').find({}).toArray((erro, especialidades) => {
            if (erro) throw erro
            res.render('cadastroMedicos', { resultado, action, especialidades })
        })
    })
})


// LISTEN
app.listen(port, () => {
    console.log(`Servidor rodando na porta: ${port}`)
})