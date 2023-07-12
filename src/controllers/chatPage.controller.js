const { isVideoCall } = require("../utils/rooms")
const { join } = require('path')

const CHAT_PUBLIC_DIR = join(__dirname, '..', '..', 'public', 'chat')
const CHAT_VIDEOCALL_MOBILE = join(CHAT_PUBLIC_DIR, 'mobile', 'chat-videocall-mobile.html')
const CHAT_VIDEOCALL = join(CHAT_PUBLIC_DIR, 'chat-videocall.html')
const CHAT = join(CHAT_PUBLIC_DIR, 'chat.html')

const detectMobile = (userAgent) => {
  const toMatch = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i
  ]

  return toMatch.some((toMatchItem) => {
    return userAgent.match(toMatchItem)
  })

}

module.exports = (req, res) => {

  const {username, roomid} = req.query
  if (username === undefined || roomid === undefined) {
    return res.status(400).send('<h1>400 Bad Request</h1>')
  }

  let isMobile = detectMobile(req.get('User-Agent'))
  
  if (isVideoCall(roomid)) {
    if (isMobile) {
      return res.sendFile(CHAT_VIDEOCALL_MOBILE)
    }
    return res.sendFile(CHAT_VIDEOCALL)
  }

  return res.sendFile(CHAT)
}
