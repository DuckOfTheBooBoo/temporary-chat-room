class MediaController {
  constructor(videoObj) {
    this.videoObj = videoObj
    this.getMedia()
  }

  async getMedia() {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    })
  }
  
  enableCamera() {
    this.videoObj.srcObject = this.stream
  }

  disableCamera() {
    this.videoObj.srcObject = null
  }

  enableMicrophone() {}

  disableMicrophone() {}
}
// const { RTCPeerConnection, RTCSessionDescription } = window
// const ownVideo = document.querySelector('#video-div-own video')
// const video = new MediaController(ownVideo)

