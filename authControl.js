const jwt = require('jsonwebtoken')
const {secret} = require('./config.js')
class AuthControl {

    async checkToken(token) {
        if (!token) {
            return false
        }
        try {
            user = jwt.verify(token, secret)
            if (user){
                return {
                    id: user.id,
                    login: user.login,
                    role: user.role
                }
            }
            return false
        } catch(e) {
            return false
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