const {PeerServer} = require('peer')

module.exports = PeerServer({
  port: 8081,
  path: '/peer'
})
