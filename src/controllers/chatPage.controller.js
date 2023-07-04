const {join} = require('path')

module.exports = (req, res) => {
  return res.sendFile(join(__dirname, '..', '..', 'public', 'chat', 'chat.html'))
}
