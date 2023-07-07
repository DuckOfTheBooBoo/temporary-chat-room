const {Router} = require('express')
const { createRoom, getRoomsFromArray } = require('../controllers/api.controller')

const router = Router()

router.route('/room')
    .get(getRoomsFromArray)
    .post(createRoom)

module.exports = router