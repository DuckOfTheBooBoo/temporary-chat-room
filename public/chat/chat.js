$(function() {
  // eslint-disable-next-line no-undef
  function createNotice(message) {

    const msg = $('<p>').text(message)
    const noticeDiv = $('<div>').addClass('notice').append(msg)
    
    $('.chats').append(noticeDiv)
  }
  const socket = io();
  
  socket.on('message', (message) => {
    console.log(message)
    createNotice(message)
  })
  
})
