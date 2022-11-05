const express = require('express')
const router = express.Router()
const UserControllers = require('../controllers/users.js');
const auth = require('../middleware/auth.js')

router.get('/sign', UserControllers.sign)
router.post('/registration', UserControllers.registration)
router.post('/notification', auth.sign, UserControllers.notification)

module.exports = router