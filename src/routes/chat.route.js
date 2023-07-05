const {Router} = require('express')
const chatPageController = require('../controllers/chatPage.controller')

const router = Router()

router.get('/', chatPageController)

module.exports = router
