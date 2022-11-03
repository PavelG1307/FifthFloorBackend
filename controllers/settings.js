const db = require('../db/db')

class UserController {
    async get(req, res) {
        const query = `
        SELECT station,
        app,
        json_build_object(
            'login', login,
            'email', email,
            'phonenumber', phonenumber,
            'password', '') as account,
            json_build_object('message','') as support
            FROM settings AS s
            JOIN users AS u ON s.user_id = u.id
            WHERE s.user_id = ${ req.user.id }`
        const settings = await db.query(query).catch((e) => {console.log(e)})
        res.json({success: !!settings, data: settings?.rows[0]})
    }
    async update(req, res) {
        const {type, data} = req.body
        let settings = null
        let query = null
        if (type === 'account') {
            console.log(data)
            settings = 'В разработке'
        } else if (type === 'station') {
            query = `
            UPDATE settings
            SET station = '${JSON.stringify(data)}'
            WHERE user_id = ${req.user.id}
            RETURNING *`
        } else if (type === 'app') {
            query = `
            UPDATE settings
            SET app = '${JSON.stringify(data)}'
            WHERE user_id = ${req.user.id}
            RETURNING *`
        } else if (type === 'support') {
            query = `
            INSERT INTO support
            VALUES
            (${req.user.id}, '${req.user.email}', '${data.message}', '{}')
            RETURNING *`
        }
        if (query) { settings = await db.query(query).catch((e) => {console.log(e)}) }
        console.log(query)
        res.json({ success: !!settings })
    }
}

module.exports = new UserController()