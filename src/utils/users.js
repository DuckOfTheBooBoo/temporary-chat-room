const users = []

// Join user to chat
function userJoin(id, username, roomid) {
  const user = {
    id,
    username,
    roomid
  }
  console.log(`Adding ${JSON.stringify(user)} to users list`)
  users.push(user)

  return user
}

function getCurrentUser(id) {
  return users.find(user => user.id === id)
}

function userLeave(id) {
  const index = users.findIndex(user => user.id === id)
  
  if (index !== -1) {
    console.log(`Remove user ${JSON.stringify(users[index])} from users list`)
    return users.splice(index, 1)
  }
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave
}
