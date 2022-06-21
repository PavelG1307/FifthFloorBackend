const db = require('../db')
const bcrypt = require('bcryptjs')
const jwt = require('../authControl.js')

class UserController {

    async createUser(login, password) {
        const hash_password = bcrypt.hashSync(password,7)
        const role = 'USER'
        if (await CheckLogin(login)) {
            const newUser = await db.query(`INSERT INTO users (login,password,role) VALUES ($1,$2,$3) RETURNING *`, [login, hash_password, role])
            const token = await jwt.generateToken(newUser.id, newUser.login, newUser.role)
            return {error: null, token: token}
        } else {
            return {error: 'Логин уже занят', tokken: null}
        }
    }

    async getUser(login, password) {
        const hash_password = bcrypt.hashSync(password,7)
        const this_user = (await db.query(`SELECT id, password, role FROM users WHERE login = $1`, [login])).rows[0]
        if (this_user) {
            const Validpassword = bcrypt.compareSync(password, this_user.password)
            if (Validpassword) {
                const token = await jwt.generateToken(this_user.id, this_user.login, this_user.role)
                return {error: null, token: token}
            }
        }
        return {error: 'USER NOT FOUND', user: null}
    }
    async getUsers() {
        
    }
    async updateUser(id) {
        
    }
    async deleteUser(id) {
        
    }
}

async function CheckLogin(login){
    const user = await db.query(`SELECT * FROM users WHERE login = $1`,[login])
    if (user.rows[0]) {
        return false
    }
    return true
}

module.exports = new UserController()