$(function() {
  // eslint-disable-next-line no-undef
  function createNotice(message) {

    const msg = $('<p>').text(message)
    const noticeDiv = $('<div>').addClass('notice').append(msg)
    
    $('.chats').append(noticeDiv)
  }

  function createChatOwn(message) {

    const chatContainer = $('<div>').addClass('chat own').append([
      $('<div>').addClass('chat-name').append(
        $('<p>').addClass('username').text('You')
      ),
      $('<p>').addClass('chat-message').text(message)
    ])

    $('.chats').append(chatContainer)
  }

  const socket = io();
  
  socket.on('message', (message) => {
    console.log(message)
    createNotice(message)
  })
  
})
