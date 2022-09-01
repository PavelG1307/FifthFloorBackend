const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth.js')
const RingControllers = require('../controllers/rings.js')

router.post('/edit', auth.sign, RingControllers.editRing)
router.post('/activate', auth.sign, RingControllers.setActiveRing)
router.post('/visible', auth.sign, RingControllers.setVisibleRing)
router.get('', auth.sign, RingControllers.getRings)

module.exports = router