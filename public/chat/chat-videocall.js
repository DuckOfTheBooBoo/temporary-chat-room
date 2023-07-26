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
  
  function overlayConfim(msg) {
    function genId() {
      const chars = 'abcdefghijklmnopqrstuvwxyz'
      let randomString = ''

      for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length)
        randomString += chars[randomIndex]
      }

      return randomString
    }

    const parentDiv = $('<div>').addClass('message')
    const buttonDiv = $('<div>').addClass('buttons')

    const message = $('<p>').text(msg)

    const declineId = genId()
    const acceptId = genId()

    const declineBtn = $('<button>').text('No').attr('id', `decline-${declineId}`).addClass('btn-decline')
    const acceptBtn = $('<button>').text('Yes').attr('id', `accept-${acceptId}`).addClass('btn-accept')

    buttonDiv.append([declineBtn, acceptBtn])

    parentDiv.append([message, buttonDiv])
    $('.message-overlay').append(parentDiv)

    return {
      overlay: parentDiv, accept: acceptBtn, decline: declineBtn
    }
  }

  function loadingOverlay(msg) {
    // Create the outer div with class "loading"
    var loadingDiv = $('<div>').addClass('loading');

    // Create the div with class "lds-spinner" for the spinner animation
    var spinnerDiv = $('<div>').addClass('lds-spinner');

    // Create 12 child divs for the spinner animation
    for (var i = 0; i < 12; i++) {
      spinnerDiv.append($('<div>'));
    }

    // Create the paragraph with the loading message
    var messageParagraph = $('<p>').text(msg);

    // Append the spinner and the message to the loading div
    loadingDiv.append(spinnerDiv, messageParagraph);

    // Append the loading div to the container in the HTML
    $('.video-frame').prepend(loadingDiv)

    return loadingDiv
  } 

  function startCall() {
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

    navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    }).then(stream => {
      const localVideo = document.querySelector('#video-div-own video')
      localVideo.srcObject = stream

      console.log('Calling ', window.peerid)
      window.peerConn.send({
        requestType: 'call'
      })

      const loadingWaitCall = loadingOverlay('Waiting for answer')

      window.peerConn.on('data', data => {
        if (data.responseType === 'call' && data.action === 'accept') {
          loadingWaitCall.remove()
          console.log('Call answered')

          const call = peer.call(window.peerid, stream)

          call.on('stream', function(remoteStream) {
            const remoteVideo = document.querySelector('#video-div-foreign video')
            remoteVideo.srcObject = remoteStream
          })

        } else if (data.responseType === 'call' && data.action === 'decline') {
          loadingWaitCall.remove()
          console.log('Call declined')
          alert('Call declined')
        }
      })
    }).catch(err => {
      alert('Error occurred, check log.')
      console.error(err)
    })
  }

  // eslint-disable-next-line no-undef
  const {username, roomid} = Qs.parse(this.location.search, {
    ignoreQueryPrefix: true,
  })

  // Set Username at video frame
  $('#video-div-own p').text(username)

  let roomUsers = []
  let localStream
  let remoteStream
  let isCall = false
  let callResponse
  let callRequest
  let cameraOn = false
  let micrphoneOn = false

  // eslint-disable-next-line no-undef
  const socket = io();
  // eslint-disable-next-line no-undef
  const peer = new Peer(undefined, {
    host: '/',
    path: '/',
    port: 8081
  })

  const loading = loadingOverlay('Waiting for another peer')

  peer.on('open', id => {
    console.log(id)
    socket.emit('joinRoom', {
      username, roomid, id
    })
  })
  
  peer.on('connection', conn => {
    window.peerid = conn.peer
    window.peerConn = conn

    loading.remove()

    const {overlay: startCallOverlay, accept, decline} = overlayConfim('Start Call?')

    accept.on('click', function() {
      startCallOverlay.remove()
      startCall(peer)
    })

    decline.on('click', function () { 
      startCallOverlay.remove()
    })

    window.peerConn.on('data', data => {
      if (data.requestType === 'call') {
        startCallOverlay.remove()
        const {overlay: AnswerCallOverlay, accept, decline} = overlayConfim('Answer Call?')
        
        accept.on('click', function() {
          AnswerCallOverlay.remove()
          window.peerConn.send({
            responseType: 'call',
            action: 'accept'
          })

          peer.on('call', function(call) {
            navigator.mediaDevices.getUserMedia({audio: true, video: true})
                .then(stream => {
                  const localVideo = document.querySelector('#video-div-own video')
                  localVideo.srcObject = stream

                  call.answer(stream)
                  call.on('stream', function(remoteStream) {
                    const remoteVideo = document.querySelector('#video-div-foreign video')
                    remoteVideo.srcObject = remoteStream
                  })
                })
                .catch(err => {
                  alert('Error occurred, check log.')
                  console.error(err)
                })
          })
        })
    
        decline.on('click', function () { 
          AnswerCallOverlay.remove()
          window.peerConn.send({
            responseType: 'call',
            action: 'decline'
          })
        })  
      }
    })
  })

  $('.room-id-container span').text(roomid)

  socket.on('peer-connect', peerid => {
    window.peerid = peerid
    window.peerConn = peer.connect(window.peerid)

    window.peerConn.on('open', () => {
      console.log('Connected to ', peerid)
      loading.remove()
    }) 
    
    const {overlay, accept, decline} = overlayConfim('Start Call?') 
    
    accept.on('click', function() {
      overlay.remove()
      startCall(peer)
    })

    decline.on('click', function() {
      overlay.remove()
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
    // Call later
    if (!isCall & !callRequest) {
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

      // Decline call
    } else if (callRequest && !isCall) {
      console.log('Declining call')
      window.peerConn.send({
        responseType: 'call',
        action: 'decline'
      })
      $('.message-overlay').hide()
      callRequest = false
    }
    else {
      $('.message-overlay').hide()
    }
  })

  $('.call-div button').on('click', function() {
    if (isCall) {
      $('.message-overlay').each(function() {
        $(this).find('p').text('End Call?')
        $('#message-decline').text('No').css({display: 'flex'})
        $('#message-accept').text('Yes').css({display: 'flex'})
        $(this).show()
      })
    } else {
      $('.message-overlay').each(function() {
        $(this).find('p').text('Start Call?')
        $('#message-decline').text('No').css({display: 'flex'})
        $('#message-accept').text('Yes').css({display: 'flex'})
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
