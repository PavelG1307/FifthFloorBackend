const db = require('../../db/db')

module.exports.getRings = async (userId, visible, id) => {
    if (id === 'new') {
        const query = `SELECT id FROM rings WHERE NOT visible and user_id = ${userId} ORDER BY id`
        const res = await db.query(query)
        if (res.rows[0]) { return res.rows[0].id} else { return null }
    }
    const reqId = id ? `and id = ${id}` : ''
    const reqVisible = visible ? 'and visible' : ''
    const query = `SELECT * FROM rings WHERE user_id = ${userId} ${reqVisible} ${reqId} ORDER BY id`
    const res = await db.query(query)
    return res.rows
}