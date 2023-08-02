$(function() {

  // class CallEvent {
  //   constructor() {
  //     this.events = {}
  //   }

  //   on(eventName, callback) {
  //     if (!this.events[eventName]) {
  //       this.events[eventName] = []
  //     }
  //     this.events[eventName].push(callback)
  //   }

  //   emit(eventName, ...args) {
  //     const eventCallbacks = this.events[eventName]
  //     if (eventCallbacks) {
  //       eventCallbacks.forEach(callback => callback(...args))
  //     }
  //   }

  //   off(eventName, callback) {
  //     const eventCallbacks = this.events[eventName]
  //     if (eventCallbacks) {
  //       this.events[eventName] = eventCallbacks.filter(cb => cb !== callback)
  //     }
  //   }
  // }

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
  
  function overlayConfim(msg, acceptMsg = 'Yes', declineMsg = 'No') {
    function genId() {
      const chars = 'abcdefghijklmnopqrstuvwxyz'
      let randomString = ''

      for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length)
        randomString += chars[randomIndex]
      }

      return randomString
    }

    if ($('.message').length > 0) {
      $('.message').remove()
    }

    const parentDiv = $('<div>').addClass('message')
    const buttonDiv = $('<div>').addClass('buttons')

    const message = $('<p>').text(msg)

    const declineId = genId()
    const acceptId = genId()

    const declineBtn = $('<button>').text(declineMsg).attr('id', `decline-${declineId}`).addClass('btn-decline')
    const acceptBtn = $('<button>').text(acceptMsg).attr('id', `accept-${acceptId}`).addClass('btn-accept')

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
  
  function purgeMedia() {
    localVideo.srcObject = null
    window.localStream = null
    remoteVideo.srcObject = null
    window.remoteStream = null
  }

  function startCall() {
    window.startCallCalled += 1
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
      window.localStream = stream
      const localVideo = document.querySelector('#video-div-own video')
      localVideo.srcObject = stream

      console.log('Calling peer')

      socket.emit('call-request')

      const loadingWaitCall = loadingOverlay('Waiting for answer')

      let i = 0
      socket.on('call-accept', () => {
        i += 1
        console.log('Call request:', i)
        console.log('Declaring event listener for call answered')
        loadingWaitCall.remove()
        console.log('Call answered')
  
        peer.addStream(window.localStream)
        
        socket.on('call-end-remote', () => {
          console.log('Declaring event listener for end call event')
          peer.removeStream(window.localStream)
          console.log('Call closed')
          window.isCall = false
          purgeMedia()
        })
      })

      socket.on('call-decline', () => {
        loadingWaitCall.remove()
        console.log('Call declined')
        alert('Call declined')
      })
    }).catch(err => {
      alert('Error occurred, check log.')
      console.error(err)
    })
  }

  function callAnswer() {
    // $('.message').remove()
    window.callAnswerCalled =+ 1
    socket.emit('call-accept')

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
    
    navigator.mediaDevices.getUserMedia({audio: true, video: true})
      .then((stream) => {
        window.localStream = stream
        const localVideo = document.querySelector('#video-div-own video')
        localVideo.srcObject = window.localStream
        peer.addStream(window.localStream)
        window.isCall = true

        socket.on('call-end-remote', () => {
            console.log('Declaring event listener for end call event')
            peer.removeStream(window.localStream)
            console.log('Peer closed')
            window.isCall = false
            purgeMedia()
            // eventUnsubscribe()
          })
      })
      .catch((err) => {
        alert('Error occurred, check log')
        console.error(err)
      })
  }

  function endCall() {
    peer.removeStream(window.localStream)
    console.log('Peer closed')
    window.isCall = false
    purgeMedia()
    socket.emit('call-end')
    eventUnsubscribe()
  }
  
  function eventUnsubscribe() {
    // Unsubscribe to event listeners
    console.log('Unsubscribing event listeners')
    socket.off('call-answer')
    socket.off('call-decline')
    socket.off('call-end-remote')
  }

  // DEBUG
  window.manualExchange = () => {
    const choice = confirm('Yes for offer, No for answer')

    if (choice) {
      const offer = prompt('Offer')
      if (offer) {
        peer.signal(offer)
      }
    } else {
      const answer = prompt('Answer')
      if (answer) {
        peer.signal(answer)
      }
    }
  }

  // eslint-disable-next-line no-undef
  const {username, roomid, initiator: initiatorVal} = Qs.parse(this.location.search, {
    ignoreQueryPrefix: true,
  })
  const initiator = initiatorVal === 'true'

  // Set Username at video frame
  $('#video-div-own p').text(username)

  let roomUsers = []
  const localVideo = document.querySelector('#video-div-own video')
  const remoteVideo = document.querySelector('#video-div-foreign video')
  let cameraOn = false
  let micrphoneOn = false
  let isJoinedRoom = false
  let peerConnected = false
  let peerSignalTemp = undefined
  window.callAnswerCalled = 0
  window.startCallCalled = 0
  
  // eslint-disable-next-line no-undef
  const socket = io();
  // eslint-disable-next-line no-undef
  const peer = new SimplePeer({
    initiator,
    trickle: false,
    config: {
      iceServers: [
        {urls: 'stun:stun.l.google.com:19302'},
        {urls: 'stun:stun2.l.google.com:19305'},
      ] 
    }
  })
  const loading = loadingOverlay('Waiting for another peer')
  
  /**
   * Initiator creates an offer
   * Send the offer to the non-initiaor a.k.a responder peer
   * Responder recieved the offer, creates the answer
   * Send the answer to initiator
   * Initiator recieved the answer
   * Both peer are now connected
   */

  socket.emit('joinRoom', {
    username, roomid
  })

  peer.on('signal', (peerData) => {
    console.log(peerData)

    // Store peer signal temporary, since this will occur before the socket successfully joined the room
    console.log({peerSignalTemp, peerConnected})
    if (!peerSignalTemp && !peerConnected) {
      peerSignalTemp = peerData
    } else {
      socket.emit('peer-signal', peerData)
    }
  })  

  socket.on('peer-signal', (peerData) => {
    // For listening to offer and answer
    // place the latest signal inside peerSignalTemp so next time peer.on('signal') triggered, it directly emit the 'peer-signal' socket event with peerData as its payload
    peerSignalTemp = peerData
    peer.signal(peerData)
  })
  socket.on('peer-connect', () => {
    peerConnected = true
    if (peerSignalTemp) {
      console.log(peerSignalTemp)
      socket.emit('peer-signal', peerSignalTemp)
    }
  })

  socket.on('room-join', () => {
    console.log('Joined room')
    isJoinedRoom = true
  })

  peer.on('stream', (remoteStream) => {
    console.log('Declaring event listener for incoming remote stream')
    window.remoteStream = remoteStream
    remoteVideo.srcObject = window.remoteStream
    window.isCall = true
  })
  
  peer.on('connect', () => {
    console.log('Connected')
    loading.remove()
  
    const {overlay: startCallOverlay, accept, decline} = overlayConfim('Start Call?')
  
    accept.on('click', function() {
      startCallOverlay.remove()
      startCall()
    })
  
    decline.on('click', function () { 
      startCallOverlay.remove()
    })
  
    socket.on('call-request', () => {
      startCallOverlay.remove()
  
      const {overlay, accept, decline} = overlayConfim('Answer Call?')
  
      accept.on('click', function() {
        overlay.remove()
        socket.emit('call-accept')
        callAnswer()
      })
  
      decline.on('click', function() {
        overlay.remove()
        socket.emit('call-decline')
      })
    })
  })


  $('.room-id-container a').attr('href', `/?roomid=${roomid}`).text(roomid)
    
  socket.on('call-request', () => {
    $('.message').remove()

    const {overlay, accept, decline} = overlayConfim('Answer Call?')

    accept.on('click', function() {
      overlay.remove()
      socket.emit('call-accept')
    })

    decline.on('click', function() {
      overlay.remove()
      socket.emit('call-decline')
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

  $('.call-div button').on('click', function() {
    if (window.isCall) {
      const {overlay, accept, decline} = overlayConfim('End Call?')

      accept.on('click', function() {
        // TODO: Implement end call
        overlay.remove()
        endCall()
      })

      decline.on('click', function() {
        overlay.remove()
      })

    } else {
      const {overlay, accept, decline} = overlayConfim('Start Call?')

      accept.on('click', function() {
        overlay.remove()
        startCall()
      })

      decline.on('click', function() {
        overlay.remove()
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
