const express = require('express')
const router = express.Router()
const UserControllers = require('../controllers/users.js');

router.get('/sign', UserControllers.sign)
router.post('/registration', UserControllers.registration)

module.exports = router