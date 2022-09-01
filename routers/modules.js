const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth.js')
const ModuleControllers = require('../controllers/modules.js')

router.post('/set', auth.sign, ModuleControllers.set)
router.put('/update', auth.sign, ModuleControllers.updateName)
router.delete('/delete', auth.sign, ModuleControllers.delete)

module.exports = router