const db = require('../db/db')
const bcrypt = require('bcryptjs')
const jwt = require('../authControl.js')

class UserController {

  async registration(req, res) {
    try {
      const { login, password, email, phone } = req.body
      console.log({ login, password, email, phone })
      if (!(login && password && email && phone)) {
        res.json({ success: false, message: 'Не все данные' })
        return
      }

      const hashPassword = bcrypt.hashSync(password, 7)
      const role = 'user'
      if (await CheckLogin(login)) {
        const newUser = (await db.query(`INSERT INTO users (login,password,role,email,phonenumber) VALUES ($1,$2,$3,$4,$5) RETURNING *`, [login.toLowerCase(), hashPassword, role, email, phone])).rows[0]
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
    console.log(req.query)
    try {
      const { login, password } = req.query
      const thisUser = (await db.query(`SELECT * FROM users WHERE login = $1`, [login.toLowerCase()])).rows[0]
      if (thisUser) {
        const isValidPassword = bcrypt.compareSync(password, thisUser.password)
        if (isValidPassword) {
          delete thisUser.password
          const token = await jwt.generateToken(thisUser).catch(()=>{})
          if(token) res.json({ success: true, token, data: thisUser, newUser: false })
          else res.json({ success: false, message: 'Пользователь не найден' })
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
}

async function CheckLogin(login) {
  const user = await db.query(`SELECT * FROM users WHERE login = $1`, [login])
  if (user.rows[0]) {
    return false
  }
  return true
}

module.exports = new UserController()