const socketIo = require('socket.io')
const formatMessage = require('../utils/messageWrapper')
const {userJoin, userLeave, getCurrentUser} = require('../utils/users')
const { addUserToRoom, removeUserFromRoom, getRoom, deleteRoom } = require('../utils/rooms')

const socketIoServer = (httpServer) => {
  const io = new socketIo.Server(httpServer)

  io.on('connection', (socket) => {
    socket.on('joinRoom', ({username, roomid, id: peerid}) => {
      const user = userJoin(socket.id, username, roomid)

      try {
        addUserToRoom(roomid, user)
        socket.join(user.roomid)

        if (peerid) {
          socket.broadcast.to(user.roomid).emit('peer-connect', peerid)
        }
        // Tell client that connection is successful
      } catch (error) {
        console.error(error)

        // Emit error message to client
        socket.emit('errconn', error.message)
        // Disconnect socket
        socket.disconnect()
      }
      
      socket.emit('notice', 'Welcome to the chat')
      socket.broadcast.to(user.roomid).emit('notice', {
        type: 'user-join',
        message: `${user.username} has joined`,
      })
  
      socket.on('chatMessage', (message) => {
        socket.broadcast.to(user.roomid).emit('message', formatMessage(user.username, message.message))
      })

      socket.on('disconnect', () => {
        const user = getCurrentUser(socket.id)
        if (user) {
          io.to(user.roomid).emit('notice', `${user.username} has leave the chat`)
          removeUserFromRoom(roomid, user)
          userLeave(user.id)
          
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
