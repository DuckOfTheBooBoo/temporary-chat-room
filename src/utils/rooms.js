let rooms = []

const addRoom = (roomid, maxUsers, videoCall, users = []) => {
  const room = rooms.find(room => room.id === roomid)
  if (!room) {
    const config = {
      id: roomid,
      maxUsers,
      videoCall,
      users
    }
    console.log('Creating room with config: ', config) 
    rooms.push(config)
  } else {
    throw new Error('Room exists')
  }
}

const addUserToRoom = (roomid, user) => {
  const room = rooms.find(room => room.id === roomid)

  if (!room) {
    throw new Error('Room not found')
  }

  if (room.users.length === room.maxUsers) {
    throw new Error('Room is full')
  }
  room.users.push(user)
}

const removeUserFromRoom = (roomid, user) => {
  const room = rooms.find(room => room.id === roomid)

  if (!room) {
    throw new Error('Room not found')
  }

  rooms.forEach(room => {
    room.users = room.users.filter(roomUser => roomUser.id !== user.id)
  })

}

const deleteRoom = (roomid) => {
  rooms = rooms.filter(room => room.id !== roomid)
}

const getRoom = (roomid) => {
  return rooms.find(room => room.id === roomid)
}

const isVideoCall = (roomid) => {
  const room = rooms.find(room => room.id === roomid)

  if (room) {
    return room.videoCall
  }

  throw new Error('Room not found')
}

module.exports = {
  addRoom,
  addUserToRoom, 
  removeUserFromRoom,
  deleteRoom,
  getRoom,
  isVideoCall
}
