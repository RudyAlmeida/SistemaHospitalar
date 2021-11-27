const S3 = require('aws-sdk/clients/s3')
const fs = require('fs')
require('dotenv').config({ path: './.env' })
const buckecteName = process.env.BUCKETNAME
const accessKeyId = process.env.ACEESKEYID
const secretAccessKey = process.env.SECRETACCESSKEY
const region = process.env.REGION
const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey
})

function uploadFile(file) {
    const fileStream = fs.createReadStream('./uploads/' + file.filename)

    const uploadParams = {
        Bucket: buckecteName,
        Body: fileStream,
        Key: file.filename
    }
    return s3.upload(uploadParams).promise()
}
exports.uploadFile = uploadFile

function getFileStream(fileKey) {
    const downloadParams = {
        Key: fileKey,
        Bucket: buckecteName
    }
    return s3.getObject(downloadParams).createReadStream()
}
exports.getFileStream = getFileStream