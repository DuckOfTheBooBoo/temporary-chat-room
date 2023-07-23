const {addRoom, getRooms} = require('../utils/rooms')

const createRoom = (req, res) => {
  const {roomid, maxUsers, videoCall = false} = req.body
 
  try {
    addRoom(roomid, parseInt(maxUsers), videoCall)
    return res.status(200).json({
      status: 'success',
      message: 'Successfully created the room',
      data: {
        roomid
      }
    })
  } catch (error) {
    console.error(error)
    return res.status(403).json({
      status: 'fail',
      message: '403 Forbidden, room exist'
    })
  }
}


const getRoomAvailability = (req, res) => {
  const {username, roomid} = req.query
  const rooms = getRooms()
  const room = rooms.find(room => room.id === roomid)
  
  if (room) {
    if (room.users.length === room.maxUsers) {
      return res.status(403).json({
        status: 'fail',
        message: 'Room is full',
      })
    }
    // Check if username exists in room
    for (const user of room.users) {
      if (user.username === username) {
        return res.status(403).json({
          status: 'fail',
          message: 'Username exists',
        })
      }
    }

    return res.status(200).json({
      status: 'success',
      message: 'Room available',
    })
  }
  return res.status(404).json({
    status: 'fail',
    message: 'Room not found'
  })
}

const getUsersinRoom = (req, res) => {
  const {username, roomid} = req.query
  const rooms = getRooms()

  const room = rooms.find(room => {
    return room.id === roomid && room.users.some(user => user.username === username)
  })

  if (room) {
    return res.status(200).json({
      status: 'success',
      message: 'Data retrieved successfully',
      data: room.users
    })
  }

  return res.status(403).json({
    status: 'fail',
    message: '403 Forbidden'
  })
}

module.exports = {
  createRoom,
  getUsersinRoom,
  getRoomAvailability
}