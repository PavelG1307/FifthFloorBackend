const jwt = require('jsonwebtoken')
const {secret} = require('./config.js')
class AuthControl {

    async checkToken(token) {
        if (!token) {
            return null
        }
        try {
            return jwt.verify(token, secret)
        } catch(e) {
            return null
        }
    }

    async generateToken(id, login, role) {
        const payload = {
            id,
            login,
            role
        }
        const token = await jwt.sign(payload, secret, {expiresIn: "72h"})
        return token
    }
}

module.exports = new AuthControl()