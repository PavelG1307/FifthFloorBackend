const db = require('../db/db')
const bcrypt = require('bcryptjs')
const jwt = require('../authControl.js')

class UserController {

  async registration(req, res) {
    try {
      const { login, password, email, phone } = req.body
      if (!(login && password && email && phone)) {
        res.json({ success: false, message: 'Не все данные' })
        return
      }

      const hashPassword = bcrypt.hashSync(password, 7)
      const role = 'user'
      if (await CheckLogin(login)) {
        const code = 1111
        const newUser = (await db.query(`
        INSERT INTO users (login, password, role, email, phonenumber, code)
        VALUES ('${login.toLowerCase()}','${hashPassword}','${role}','${email}','${phone}', ${code}) RETURNING *`)).rows[0]
        const token = await jwt.generateToken(newUser.id, newUser.login, newUser.role)
        res.json({ success: true, token, data: newUser, newUser: true })
      } else {
        res.json({ success: false, message: 'Логин уже занят' })
      }
    } catch (e) {
      console.log(e)
      res.json({ success: false, message: 'Ошибка на сервере' })
    }
  }

  async sign(req, res) {
    try {
      const { login, password, code } = req.query
      if (!login) {
        res.json({ success:false })
        return
      }
      const thisUser = (await db.query(`SELECT * FROM users WHERE login = '${login.toLowerCase()}'`)).rows[0]
      if (thisUser) {
        let isValidPassword = false
        if (code) {
          console.log(thisUser.code);
          isValidPassword = Number(code) === thisUser.code
        } else {
          isValidPassword = bcrypt.compareSync(password, thisUser.password)
        }
        if (isValidPassword) {
          delete thisUser.password
          const token = await jwt.generateToken(thisUser)
          if (token) res.json({ success: true, token, data: thisUser, newUser: false })
          return
        }
      }
      res.json({ success: false, message: 'Пользователь не найден' })
    } catch (e) {
      console.log(e)
      res.json({ success: false, message: 'Ошибка на сервере' })
    }
  }
  async getUsers() {

  }
  async updateUser(id) {

  }
  async deleteUser(id) {

  }

  async checkCode(req, res) {
    if (req.code = '1111') {

    }
  }
  async notification(req, res) {
    const token = req.body
    const query = `
    UPDATE users
    SET devices = array_append(devices,'${token}')
    WHERE id = ${req.user.id}`
    const success = await db.query(query).catch((e) => console.log(e))
    res.json({ success: !!success })
  }
}

async function CheckLogin(login) {
  const user = await db.query(`SELECT * FROM users WHERE login = $1`, [login])
  if (user.rows[0]) {
    return false
  }
  return true
}

module.exports = new UserController()