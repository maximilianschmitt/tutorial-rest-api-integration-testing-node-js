const express = require('express')
const { MongoClient } = require('mongodb')
const bodyParser = require('body-parser')
const ValidationError = require('./errors/ValidationError')
const ResourceNotFoundError = require('./errors/ResourceNotFoundError')

const PORT = process.env.PORT || 3000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const MONGODB_DB = process.env.MONGODB_DB || 'todoman'

main()

async function main() {
  const mongoClient = await MongoClient.connect(
    MONGODB_URI,
    { useNewUrlParser: true }
  )

  const db = mongoClient.db(MONGODB_DB)

  const app = express()

  app.use(bodyParser.json())

  app.use(function attachDb(req, res, next) {
    req.db = db

    next()
  })

  app.get('/', function(req, res, next) {
    res.status(200).json({ name: 'todoman-backend' })
  })

  app.use(require('./todos/routes'))

  app.use(function handleErrors(err, req, res, next) {
    if (err instanceof ValidationError) {
      return res.status(400).json({ error: err })
    }

    if (err instanceof ResourceNotFoundError) {
      return res.status(404).json({ error: err })
    }

    next(err)
  })

  app.listen(PORT, err => {
    if (err) {
      throw err
    }

    // eslint-disable-next-line no-console
    console.log(`api-server listening on port ${PORT}`)
  })
}
