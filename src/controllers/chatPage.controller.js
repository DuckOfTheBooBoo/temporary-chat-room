const { isVideoCall } = require("../utils/rooms")

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
      return res.render('pages/chat-videocall-mobile')
    }
    return res.render('pages/chat-videocall')
  }

  return res.render('pages/chat')
}
