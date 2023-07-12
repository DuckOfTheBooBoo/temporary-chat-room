$(function() {
  function scrollDown() {
    const chatMessages = document.querySelector('.chats')
    chatMessages.scrollTop = chatMessages.scrollHeight
  }

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

  function createChatForeign(data) {
    const chatContainer = $('<div>').addClass('chat foreign').append([
      $('<div>').addClass('chat-name').append(
        $('<p>').addClass('username').text(data.username)
      ),
      $('<p>').addClass('chat-message').text(data.message)
    ])

    $('.chats').append(chatContainer)
  }

  // eslint-disable-next-line no-undef
  const socket = io();
  
  // eslint-disable-next-line no-undef
  const {username, roomid} = Qs.parse(this.location.search, {
    ignoreQueryPrefix: true,
  })

  $('.room-id-container span').text(roomid)

  socket.emit('joinRoom', {
    username, roomid
  })

  socket.on('notice', (message) => {
    createNotice(message.message)
  })

  socket.on('message', (message) => {
    createChatForeign(message)
  })

  socket.on('errconn', (message) => {
    alert(message)
    window.location.href = '/'
  })

  $('#form-message').on('submit', function(event) {
    event.preventDefault()

    const formData = new FormData(event.target)
    const data = {}

    for (const [key, val] of formData.entries()) {
      data[key] = val
    }

    createChatOwn(data.message)
    socket.emit('chatMessage', {
      username: username,
      message: data.message
    })
    scrollDown()
    $('#message-field').val('')
  })
  
  // Buttons
  

})
