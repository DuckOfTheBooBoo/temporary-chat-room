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

  $('#form-field').on('submit', function(event) {
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

    console.log(data)

    // window.location = `/chat?username=${data.username}&roomid=${data.roomid}`
  })


})
