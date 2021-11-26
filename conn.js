const mongodb = require('mongodb').MongoClient
require('dotenv').config({ path: './.env' })
const url = process.env.MONGOURL

const client = new mongodb(url)

async function run() {
    try {
        await client.connect()
        console.log('Estamos conectados ao banco')
    } catch (err) {
        console.log(err)
    }
}
run()
module.exports = client