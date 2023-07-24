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
  const {username, roomid} = Qs.parse(this.location.search, {
    ignoreQueryPrefix: true,
  })

  // Set Username at video frame
  $('#video-div-own p').text(username)

  let roomUsers = []
  let localStream = null
  let remoteStream = null
  let isCall = false
  let cameraOn = false
  let micrphoneOn = false
  const videoObj = document.querySelector('#video-div-own video')

  // eslint-disable-next-line no-undef
  const socket = io();
  // eslint-disable-next-line no-undef
  const peer = new Peer({
    host: '/',
    path: '/',
    port: 8081
  })

  peer.on('open', id => {
    socket.emit('joinRoom', {
      username, roomid, id
    })
  })
  
  peer.on('connection', conn => {
    $('.loading').hide()
    $('.message').css({
      display: 'flex'
    })
  })

  $('.room-id-container span').text(roomid)

  socket.on('peer-connect', peerid => {
    const conn = peer.connect(peerid)

    conn.on('open', () => {
      $('.loading').hide()
      $('.message').css({
        display: 'flex'
      })
    })
  })

    // Buttons
  // Camera toggle
  $('.camera-div button').on('click', function() {
    if (!cameraOn) {
      $('.camera-div img').attr('src', '../assets/icons/camera-video-fill.svg')
      cameraOn = true
    } else {
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
    } else {
      $('.message-overlay').hide()
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

  socket.on('notice', (message) => {
    $.ajax({
      url: `/api/roomInfo?username=${username}&roomid=${roomid}`,
      method: 'GET',
      success: function(response) {
        const users = response.data
        roomUsers.push(...users)
        const remoteUser = users.find(user => user.username !== username)

        if (remoteUser) {
          $('#video-div-foreign p').text(remoteUser.username)
        }
    
        if (message.type === 'user-join') {
          createNotice(`${remoteUser.username} has joined`)
        } else {
          createNotice(message)
        }
        return undefined
      },
      error: function(xhr, status, error) {
        console.error(error)
      }
    })
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
