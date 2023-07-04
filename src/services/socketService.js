const socketIo = require('socket.io')
const formatMessage = require('../utils/messageWrapper')

const socketIoServer = (httpServer) => {
  const io = new socketIo.Server(httpServer)

  io.on('connection', (socket) => {
    socket.emit('notice', formatMessage('notice', 'Welcome to the chat'))
    socket.broadcast.emit('notice', formatMessage('notice', 'A user has joined'))

    socket.on('disconnect', () => {
      io.emit('A user has disconnected')
    })

    socket.on('chatMessage', (message) => {
      socket.broadcast.emit('message', formatMessage('someone', message.message))
    })
  })

  return io
}



module.exports = socketIoServer
