const {join} = require('path')

module.exports = (req, res) => {

  const {username, roomid} = req.query
  if (username === undefined || roomid === undefined) {
    return res.status(400).send('<h1>400 Bad Request</h1>')
  }

  return res.render('pages/chat-videocall')
}
