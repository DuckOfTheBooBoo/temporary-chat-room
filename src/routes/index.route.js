const {Router} = require('express')
const indexPageController = require('../controllers/indexPage.controller')

const router = Router()

router.get('/', indexPageController)

module.exports = router
