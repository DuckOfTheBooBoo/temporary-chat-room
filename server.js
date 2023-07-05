require('dotenv').config()
const express = require('express')
const {createServer} = require('http')
const path = require('path')
const indexRouter = require('./src/routes/index.route')
const chatRouter = require('./src/routes/chat.route')
const socketIoServer = require('./src/services/socketService')


const app = express()
app.use(express.static(path.join(__dirname, 'public')))
app.use('/', indexRouter)
app.use('/chat', chatRouter)

const server = createServer(app)
const io = socketIoServer(server)

const PORT = process.env.PORT || 8080

server.listen(PORT, () => {
  console.log(`Server is listening on 127.0.0.1:${PORT}`)
})