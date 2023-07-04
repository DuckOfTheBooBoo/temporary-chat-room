const socketIo = require('socket.io')

const socketIoServer = (httpServer) => {
  const io = new socketIo.Server(httpServer)

  io.on('connection', (socket) => {
    socket.emit('notice', 'Welcome to the chat')
    socket.broadcast.emit('notice', 'A user has joined')
    
    socket.on('disconnect', () => {
      socket.emit('A user has disconnected')
    })

    socket.on('chatMessage', (message) => {
      console.log(message)
    })
  })

  return io
}



module.exports = socketIoServer
