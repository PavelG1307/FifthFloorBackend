const db = require('../../db/db')

module.exports.getRings = async (userId, visible, id) => {
    const reqId = id ? `and id = ${id}` : ''
    const reqVisible = visible ? 'and visible' : ''
    const query = `SELECT * FROM rings WHERE user_id = ${userId} ${reqVisible} ${reqId} ORDER BY id`
    console.log(query)
    const res = await db.query(query)
    return res.rows
}