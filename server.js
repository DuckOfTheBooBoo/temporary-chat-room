require('dotenv').config()
const express = require('express')
const path = require('path')
const router = require('./src/routes/index.route')

const app = express()
app.use(express.static(path.join(__dirname, 'public')))
app.use(router)

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
  console.log(`Server is listening on 127.0.0.1:${PORT}`)
})