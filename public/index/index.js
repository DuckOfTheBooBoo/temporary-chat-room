$(function() {

  function generateRandomString() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
  
    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }
  
    return randomString;
  }  

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

    $.ajax({
      url: '/api/room',
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      success: function(response) {
        console.log(response)
      },
      error: function(xhr, status, error) {
        console.log(error)
        alert(xhr.responseJSON.message)
      }
    })
  })

  $('#join-room-form').on('submit', function(event) {
    event.preventDefault()

    const formData = new FormData(event.target)
    const data = {}

    for (const [key, val] of formData.entries()) {
      data[key] = val
    }

    $.ajax({
      url: `/api/room?roomid=${data.roomid}`,
      type: 'GET',
      success: function(response) {
        console.log(response)
      },
      error: function(xhr, status, error) {
        console.error(error)
        alert(xhr.responseJSON.message)
      }
    })
  })
})
