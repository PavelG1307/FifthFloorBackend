const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth.js')
const ModuleControllers = require('../controllers/modules.js')

router.post('/set', auth.sign, ModuleControllers.set)
router.post('/update', auth.sign, ModuleControllers.updateName)
router.delete('/delete', auth.sign, ModuleControllers.delete)
router.get('/:id', auth.sign, ModuleControllers.getOne)
module.exports = router