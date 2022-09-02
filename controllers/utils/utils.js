const db = require('../../db/db')

const getUserIdFromStationId = async(id) => {
    return (await db.query(`SELECT user_id FROM stations WHERE id = $1`, [id])).rows[0].user_id
}

const getStationIdFromUserId = async (id) => {
    console.log(id)
    return (await db.query(`SELECT id FROM stations WHERE user_id = $1`, [id])).rows[0].id
}

module.exports = { getUserIdFromStationId, getStationIdFromUserId }