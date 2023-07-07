const {Router} = require('express')
const { createRoom, getRoomAvailability } = require('../controllers/api.controller')

const router = Router()

router.route('/room')
    .get(getRoomAvailability)
    .post(createRoom)

module.exports = router