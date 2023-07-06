const users = []

// Join user to chat
function userJoin(id, username, roomid) {
  const user = {
    id,
    username,
    roomid
  }

  users.push(user)

  return user
}

function getCurrentUser(id) {
  return users.find(user => user.id === id)
}

function userLeave(id) {
  const index = users.findIndex(user => user.id === id)

  if (index !== -1) {
    return users.splice(index, 1)
  }
}

function getRoomUsers(roomid) {
  return users.filter(user => user.roomid === romid)
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
}
