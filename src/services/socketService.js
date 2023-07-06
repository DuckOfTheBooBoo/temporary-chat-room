const socketIo = require('socket.io')
const formatMessage = require('../utils/messageWrapper')
const {userJoin, getCurrentUser, userLeave} = require('../utils/users')

const socketIoServer = (httpServer) => {
  const io = new socketIo.Server(httpServer)

  io.on('connection', (socket) => {
    socket.on('joinRoom', ({username, roomid}) => {
      const user = userJoin(socket.id, username, roomid)
      socket.join(user.roomid)
      
      socket.emit('notice', formatMessage('notice', 'Welcome to the chat'))
      socket.broadcast.to(user.roomid).emit('notice', formatMessage('notice', `${user.username} has joined`))
  
      socket.on('chatMessage', (message) => {
        socket.broadcast.to(user.roomid).emit('message', formatMessage(user.username, message.message))
      })

      socket.on('disconnect', () => {
        // io.emit('A user has disconnected')
        const user = userLeave(socket.id)
        if (user) {
          io.to(user.roomid).emit('notice', `${user.username} has leave the chat`)
        }
      })
    })

  })

  return io
}



module.exports = socketIoServer
