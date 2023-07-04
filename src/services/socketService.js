const socketIo = require('socket.io')

const socketIoServer = (httpServer) => {
  const io = new socketIo.Server(httpServer)

  io.on('connection', (socket) => {
    socket.emit('message', 'Welcome to the chat')
  })

  return io
}



module.exports = socketIoServer
