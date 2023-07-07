const {addRoom, getRooms} = require('../utils/rooms')

const createRoom = (req, res) => {
  const {roomid, maxUser, videoCall} = req.body
 
  try {
    addRoom(roomid, parseInt(maxUser), videoCall)
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

module.exports = {
  createRoom,
  getRoomsFromArray
}