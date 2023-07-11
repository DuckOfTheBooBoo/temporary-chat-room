const socketIo = require('socket.io')
const formatMessage = require('../utils/messageWrapper')
const {userJoin, userLeave} = require('../utils/users')
const { addUserToRoom, removeUserFromRoom, getRoom, deleteRoom } = require('../utils/rooms')

const socketIoServer = (httpServer) => {
  const io = new socketIo.Server(httpServer)

  io.on('connection', (socket) => {
    socket.on('joinRoom', ({username, roomid}) => {
      const user = userJoin(socket.id, username, roomid)

      try {
        addUserToRoom(roomid, user)
        socket.join(user.roomid)
      } catch (error) {
        console.error(error)

        // Emit error message to client
        socket.emit('errconn', error.message)
        // Disconnect socket
        socket.disconnect()
      }
      
      socket.emit('notice', formatMessage('notice', 'Welcome to the chat'))
      socket.broadcast.to(user.roomid).emit('notice', formatMessage('notice', `${user.username} has joined`))
  
      socket.on('chatMessage', (message) => {
        socket.broadcast.to(user.roomid).emit('message', formatMessage(user.username, message.message))
      })

      socket.on('disconnect', () => {
        const user = userLeave(socket.id)
        if (user) {
          io.to(user.roomid).emit('notice', `${user.username} has leave the chat`)
          removeUserFromRoom(roomid, user)

          const room = getRoom(roomid)
          if (room) {
            if (room.users.length === 0) {
              deleteRoom(room.id)
            }
          }

        }
      })
    })

  })

  return io
}

module.exports = socketIoServer
