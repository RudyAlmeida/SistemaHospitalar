const mongodb = require('mongodb').MongoClient
require('dotenv').config({ path: './.env' })
const url = process.env.MONGOURL

const client = new mongodb(url)

async function run() {
    try {
        await client.connect()
        
        const dbs = await client.db('info').admin().listDatabases({ nameOnly: true })
        let listaDBs = []
        
        for(db of dbs.databases){
            listaDBs.push(db)
            if(db.name != 'admin' && db.name != 'local'){
                console.log(`Conectado ao Bando de Dados:\n > ${db.name}`)
                const collections = await client.db(db.name).listCollections().toArray()
                
                for (c of collections) {
                    console.log(`  - ${c.name}`)            
                }
            }
        }
        
    } catch (err) {
        console.log(err)
    }
}
run()
module.exports = client