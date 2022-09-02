const db = require('../../db/db')

module.exports.getRings = async (userId, visible) => {
    const reqVisible = visible ? 'and visible' : ''
    const query = `SELECT * FROM rings WHERE user_id = ${userId} ${reqVisible} ORDER BY id`
    console.log(query)
    const res = await db.query(query)
    return res.rows
}