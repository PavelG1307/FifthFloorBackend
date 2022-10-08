const db = require('../../db/db')
const utils = require('../utils/utils')

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

module.exports.changeActive = async (id, state, user, mqtt) => {
      const updatedRing = await db.query(`UPDATE rings SET active = ${state} WHERE id = ${id} and user_id = ${user} RETURNING *;`).catch(()=>{})
      if (!(updatedRing && updatedRing.rows[0])) {
        return { success: false }
      }
      return { success: await this.sendRings(mqtt, user), state: updatedRing.rows[0].active }
}

module.exports.sendRings = async (mqtt, user) => {
    const activeRings = await db.query(`SELECT active, id, time, sunrise, music FROM rings WHERE user_id = ${user} ORDER BY id`).catch(()=>{})
    let reqm = ''
    let count = 0
    for (const i in activeRings.rows) {
      const ring = activeRings.rows[i]
      if (ring.active) {
        count++
        reqm += i
        reqm += ("0000" + ring.time).slice(-4)
        reqm += ring.music
        reqm += ring.sunrise ? "1" : "0"
      }
    }
    reqm = "rng" + count + reqm
    const stationId = await utils.getStationIdFromUserId(user)
    const success = await mqtt.send(stationId, 'remote', reqm)
    return success
}