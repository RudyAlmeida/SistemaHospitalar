const client = require('./conn')
const dbo = client.db('SistemaHospitalar')
const express = require('express')
const exphbs = require('express-handlebars')
const app = express()
const port = 3000
const path = require('path')
const { uploadFile } = require('./s3')
const multer = require('multer')
require("dotenv").config();
const fs = require('fs')
const objectId = require('mongodb').ObjectId


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

app.get('/', (req, res) => {
    res.render('./index')
})

// CADASTRO de ESPECIALIDADES
app.get('/cadEsp', (req, res) => {
    res.render('cadEspecialidades')
})

app.post('/addEsp', (req, res)=>{
    const obj = {
        nome: req.body.especialidade
    }
    dbo.collection('Especialidades').insertOne(obj, (erro, add)=>{
      console.log(`Especialidade '${obj.nome}' cadastrada.`)
      res.redirect('/cadEsp')
    })
  })

app.get('/foto', (req, res) => {
    res.render('foto')
})

app.post('/salvarFoto', upload.single('imagem'), async(req, res) => {
    const { nome, site } = req.body;
    const file = req.file
    const resultado = await uploadFile(file)
    console.log(resultado)
})

app.listen(port, () => {
    console.log('Servidor está rodando')
})