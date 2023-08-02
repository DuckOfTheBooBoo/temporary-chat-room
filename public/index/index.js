$(function() {
  // Add query support for direct input
  // Hide create room when roomid value is not empty
  // If user emit enter on username field but roomid value is not empty, emit join room submission instead

  function objectToQuery(object, ignoreKeys = []) {
    let query = '?'

    if (typeof object !== 'object') {
      throw new Error('Object parameter is not an Object!')
    }

    for (const key of Object.keys(object)) {
      const val = object[key]
      if (ignoreKeys.includes(key)) {
        continue
      }

      if (key.includes(' ')) {
        throw new Error('Key includes spaces!')
      }

      query += `${key}=${encodeURIComponent(val)}&`
    }
    return query
  }

  function generateRandomString() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
  
    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }
  
    return randomString;
  }  

  function hideCreateRoom() {
    const childs = $('#create-room-form').children()

    for (const key in Object.keys(childs)) {
      if (key == 0 || key == 1  || key == 5) {
        continue
      }
      $(childs[key]).slideUp()
    }
  }

  function showCreateRoom() {
    const childs = $('#create-room-form').children()

    for (const key in Object.keys(childs)) {
      if (key == 0 || key == 1 || key == 5  ) {
        continue
      }
      $(childs[key]).slideDown()
    }
  }

  // eslint-disable-next-line no-undef
  const {roomid} = Qs.parse(this.location.search, {
    ignoreQueryPrefix: true,
  })

  if (roomid) {
    $('#roomid-field-join').val(roomid)
    hideCreateRoom()
    $('#create-room-form')[0].reportValidity()
  }

  $('#roomid-field-join').on('input', function() {
    if ($(this).val()) {
      hideCreateRoom()
    } else {
      showCreateRoom()
    }
  })

  $('#video-call-checkbox').on('change', function() {
    if (this.checked) {
      $('#max-user').val(2)
    }
  })

  $('#max-user').on('change', function() {
    if ($('#video-call-checkbox').prop('checked')) {
      $(this).val(2)
    }
  })

  $('#username-field-create').on('input', function() {
    $('#username-field-join').val(this.value)
  })

  $('#create-room-form').on('submit', function(event) {
    event.preventDefault()

    if ($('#roomid-field-join').val()) {
      $('#join-room-form').trigger('submit')
    } else {
      const formData = new FormData(event.target)
      const data = {}
  
      for (const [key, val] of formData.entries()) {
        data[key] = val
        if (key === 'videoCall') {
          data['videoCall'] = true
        }
      }
  
      if (!data.roomid) {
        data.roomid = generateRandomString()
      }

      // Add initiator to query
      data['initiator'] = true
  
      $.ajax({
        url: '/api/room',
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function(response) {
          const query = objectToQuery(data, ['maxUsers', 'videoCall'])
          window.location.href = '/chat' + query
        },
        error: function(xhr, status, error) {
          console.log(error)
          alert(xhr.responseJSON.message)
        }
      })
    }

  })

  $('#join-room-form').on('submit', function(event) {
    event.preventDefault()

    const formData = new FormData(event.target)
    const data = {}

    for (const [key, val] of formData.entries()) {
      data[key] = val
    }

    // Add initiator to query
    data['initiator'] = false

    $.ajax({
      url: `/api/room?username=${data.username}&roomid=${data.roomid}`,
      type: 'GET',
      success: function(response) {
        const query = objectToQuery(data)
        window.location.href = '/chat' + query
      },
      error: function(xhr, status, error) {
        console.error(error)
        alert(xhr.responseJSON.message)
      }
    })
  })

  // Trigger create-room-form field validity when join-submit-btn is clicked
  $('#join-submit-btn').on('click', function() {
    if ($('#username-field-create').val() === '') {
      $('#create-room-form')[0].reportValidity()
    }
  })
})
