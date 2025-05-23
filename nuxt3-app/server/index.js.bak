const express = require('express')

const app = express()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const users = require('./routes/users')

app.use(users)

module.exports = {
  path: '/api',
  handler: app
}
