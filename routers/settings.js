const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth.js')
const settingsControllers = require('../controllers/settings.js')

router.get('/', auth.sign, settingsControllers.get)
router.post('/', auth.sign, settingsControllers.update)


module.exports = router
