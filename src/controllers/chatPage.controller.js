const {join} = require('path')

module.exports = (req, res) => {
  return res.render('pages/chat-videocall', {
    roomid: 'Haloo'
  })
}
