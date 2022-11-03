const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth.js')
const deviceControllers = require('../controllers/devices.js')

router.get('/status', auth.sign, deviceControllers.getStatus)
router.get('/key', auth.sign, deviceControllers.getKey)
router.post('/add', auth.sign, deviceControllers.addStation)
router.post('/brightness', auth.sign, deviceControllers.setBrightness)
router.post('/speaker', auth.sign, deviceControllers.setSpeaker)
router.post('/guard', auth.sign, deviceControllers.changeGuard)

module.exports = router