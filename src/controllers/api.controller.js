const {addRoom, getRooms} = require('../utils/rooms')

const createRoom = (req, res) => {
  const {roomid, maxUsers, videoCall} = req.body
 
  try {
    addRoom(roomid, maxUsers, videoCall)
    return res.status(200).json({
      status: 'success',
      message: 'Successfully created the room'
    })
  } catch (error) {
    console.error(error)
    return res.status(403).json({
      status: 'fail',
      message: '403 Forbidden, room exist'
    })
  }
}

const getRoomsFromArray = (req, res) => {
  return res.json(getRooms())
}

const getRoomAvailability = (req, res) => {
  const {roomid} = req.query
  const rooms = getRooms()
  const room = rooms.find(room => room.id === roomid)
  
  if (room) {
    if (room.users.length === room.maxUsers) {
      return res.status(403).json({
        status: 'fail',
        message: 'Room is full'
      })
    }
    return res.status(200).json({
      status: 'success',
      message: 'Room available'
    })
  }
  return res.status(404).json({
    status: 'fail',
    message: 'Room not found'
  })
}

module.exports = {
  createRoom,
  getRoomsFromArray,
  getRoomAvailability
}