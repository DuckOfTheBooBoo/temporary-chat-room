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

  let cameraOn = false
  let micrphoneOn = false
  const videoObj = document.querySelector('#video-div-own video')
  const video = new MediaController(videoObj)

  // Buttons
  // Camera toggle
  $('.camera-div button').on('click', function() {
    if (!cameraOn) {
      video.enableCamera()
      $('.camera-div img').attr('src', '../assets/icons/camera-video-fill.svg')
      cameraOn = true
    } else {
      video.disableCamera()
      $('.camera-div img').attr('src', '../assets/icons/camera-video-off-fill.svg')
      cameraOn = false
    }
  })
  // Microphone toggle
  $('.mic-div button').on('click', function() {
    if (!micrphoneOn) {
      $('.mic-div img').attr('src', '../assets/icons/mic-fill.svg')
      micrphoneOn = true
    } else {
      $('.mic-div img').attr('src', '../assets/icons/mic-mute-fill.svg')
      micrphoneOn = false
    }
  })
  // Leave
  $('.leave-div button').on('click', function() {
    const choice = confirm('Are you sure you want to leave?')
    if (choice) {
      window.location.href = '/'
    }
  })

  // Message overlay
  $('#message-decline').on('click', function() {
    if (!isCall) {
      $('.message-overlay').hide()
      $('.call-div button').css({
        'background-color': 'rgb(57,173,72)',
        filter: 'none',
        border: '1px solid rgb(57,173,72)'
      })
      $('.call-div button').on('mouseenter', function() {
        $(this).css({
          'cursor': 'pointer'
        })
      })
    }
  })

  $('#message-accept').on('click', function() {
    if (!isCall) {
      $('.message-overlay').hide()
      $('.call-div button').each(function() {
        $(this).css({
          'background-color': 'rgb(255,0,0)',
          filter: 'none',
          border: '1px solid rgb(255,0,0)'
        });
        $(this).find('img').attr('src', '../assets/icons/phone-slash-solid.svg');
        $(this).on('mouseenter', function() {
          $(this).css('cursor', 'pointer')
        })
      })
      

      isCall = true
    } else {
      $('.message-overlay').hide()
      $('.call-div button').each(function() {
        $(this).css({
          'background-color': 'rgb(57,173,72)',
          filter: 'none',
          border: '1px solid rgb(57,173,72)'
        });
        $(this).find('img').attr('src', '../assets/icons/phone-solid.svg');
      })


      isCall = false
    }
  })

  $('.call-div button').on('click', function() {
    if (isCall) {
      $('.message-overlay').each(function() {
        $(this).find('p').text('End Call?')
        $('#message-decline').text('No')
        $('#message-accept').text('Yes')
        $(this).show()
      })
    } else {
      $('.message-overlay').each(function() {
        $(this).find('p').text('Start Call?')
        $('#message-decline').text('No')
        $('#message-accept').text('Yes')
        $(this).show()
      })
    }
  })

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
  
})
