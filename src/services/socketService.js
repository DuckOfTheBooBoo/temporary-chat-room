const socketIo = require('socket.io')
const formatMessage = require('../utils/messageWrapper')
const {userJoin, userLeave, getCurrentUser} = require('../utils/users')
const { addUserToRoom, removeUserFromRoom, getRoom, deleteRoom } = require('../utils/rooms')

const socketIoServer = (httpServer) => {
  const io = new socketIo.Server(httpServer)

  const CALL_REQUEST = 'call-request'
  const CALL_ACCEPT = 'call-accept'
  const CALL_DECLINE = 'call-decline'
  const CALL_END = 'call-end'
  const CALL_END_REMOTE = 'call-end-remote'

  io.on('connection', (socket) => {
    socket.on('joinRoom', ({username, roomid}) => {
      const user = userJoin(socket.id, username, roomid)

      try {
        addUserToRoom(roomid, user)
        socket.join(user.roomid)

        socket.emit('room-join')
        console.log('Broadcast peer-connect to other socket')
        socket.broadcast.to(user.roomid).emit('peer-connect')
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

      socket.on('peer-offer', (peerOffer) => {
        console.log('peer-offer', peerOffer)
        socket.broadcast.to(user.roomid).emit('peer-offer', peerOffer)
      })

      socket.on('peer-answer', (peerAnswer) => {
        console.log('peer-answer', peerAnswer)
        socket.broadcast.to(user.roomid).emit('peer-answer', peerAnswer)
      })

      socket.on('peer-signal', (peerData) => {
        console.log('peer-signal', peerData)
        socket.broadcast.to(user.roomid).emit('peer-signal', peerData)
      })

      socket.on('peer-ready', () => {
        console.log('Responder peer is ready')
        socket.broadcast.to(user.roomid).emit('peer-ready')
      })
      
      socket.on(CALL_REQUEST, () => {
        socket.broadcast.to(user.roomid).emit(CALL_REQUEST)
        console.log(CALL_REQUEST)
      })
      socket.on(CALL_ACCEPT, () => {
        socket.broadcast.to(user.roomid).emit(CALL_ACCEPT)
        console.log(CALL_ACCEPT)
      })
      socket.on(CALL_DECLINE, () => {
        socket.broadcast.to(user.roomid).emit(CALL_DECLINE)
        console.log(CALL_DECLINE)
      })
      socket.on(CALL_END, () => {
        socket.broadcast.to(user.roomid).emit(CALL_END_REMOTE)
        console.log(CALL_END)
      })

      socket.on('disconnect', () => {
        const user = getCurrentUser(socket.id)
        if (user) {
          io.to(user.roomid).emit('notice', `${user.username} has leave the chat`)
          io.to(user.roomid).emit('peer-left', user)
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
