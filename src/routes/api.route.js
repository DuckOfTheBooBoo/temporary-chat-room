const {Router} = require('express')
const { createRoom, getRoomAvailability, getUsersinRoom } = require('../controllers/api.controller')

const router = Router()

router.route('/room')
    .get(getRoomAvailability)
    .post(createRoom)

router.get('/roomInfo', getUsersinRoom)

module.exports = router