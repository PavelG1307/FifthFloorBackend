const db = require('../db/db')

class UserController {
    async get(req, res) {
        res.json({success: true})
    }
    async update(req, res) {
        
    }
}

module.exports = new UserController()