const db = require('../db/db')

const utils = require('./utils/utils.js')
const Devices = require('./methods/Devices')

class DeviceControllers {

  async getStatus(req, res) {
    const data = await Devices.getStatus(req.user.id)
    res.json({success: !!data, message: data ? undefined : 'Станция не найдена', data})
  }
  async addStation(req, res) {
    const { key } = req.body
    const userId = req.user.id
    try {
      const query = `INSERT INTO stations (time, battery, lamp, user_id, guard, speaker, secret_key, last_update) VALUES (0, 0, 0, ${userId}, false, 0, '${key}', NOW()) RETURNING *`
      const station = (await db.query(query)).rows
      if (station[0]) {
        for (let i = 0; i < 5; i++) {
          await db.query(`INSERT INTO rings (name, time, active, visible, sunrise, music, user_id, station_id) VALUES ('ring', 0, false, false, true, 0, $1, $2)`, [userId, station[0].id])
        }
        console.log(station[0])
        res.json({ success: true, data: station[0] })
      } else {
        res.json({ success: false, message: "Ошибка на сервере" })
      }
    } catch (e) {
      console.log(e)
      res.json({ success: false, message: "Ошибка на сервере" })
    }
  }
  async setBrightness(req, res) {
    const userId = req.user.id
    const { brightness, mode } = req.body
    const stationId = await utils.getStationIdFromUserId(userId)
    const success = await req.mqtt.send(stationId, 'remote', mode ? `MODE${mode}` : `BRT${brightness || 0}`)
    const query = `
        UPDATE stations
        SET ${mode ? `mode = ${mode}` : `lamp = ${brightness}`}
        WHERE id = ${stationId};`
        console.log(query)
    const successDB = await db.query(query).catch(() => {})
    console.log(successDB)
    res.json({success: success && successDB})
  }
  async setSpeaker(req, res) {
    const userId = req.user.id
    const volume = req.body.volume || 0
    const stationId = await utils.getStationIdFromUserId(userId)
    const success = await req.mqtt.send(stationId, 'remote', `SPQ ${volume}`)
    res.json({ success })
  }
  async changeGuard(req, res) {
    const userId = req.user.id
    const state = req.body.state ? 1 : 0
    const stationId = await utils.getStationIdFromUserId(userId)
    const success = await req.mqtt.send(stationId, 'remote', `GRD ${state}`)
    res.json({success})
  }
  async getIds(callback) {
    return callback((await db.query(`SELECT id FROM stations`)).rows.map(el => el.id))
  }
  async setStatus(status) {
    try {
      const { time, voltage, brightness, guard, speaker, id, mode} = status
      const query = `
        UPDATE stations
        SET time = ${time},
            battery = ${voltage},
            lamp = ${brightness},
            last_update = NOW(),
            guard = ${guard},
            speaker = ${speaker.volume},
            mode = ${mode}
        WHERE id = ${id}
        RETURNING user_id;`
      const userId = (await db.query(query)).rows[0].user_id
      const ringsId = (await db.query(`
        with updated as (
            UPDATE rings
            SET active = false
            WHERE user_id = ${userId}
            RETURNING id
        )
        SELECT *
        FROM updated
        ORDER BY id ASC;`
      )).rows
      for (const i in status.rings) {
        const id = ringsId[status.rings[i].id - 1].id
        const { time, sunrise, music } = status.rings[i]
        await db.query(`
          UPDATE rings 
          SET active = true,
              time = ${time},
              sunrise = ${sunrise},
              music = ${music},
              visible = true
          WHERE id = ${id}
          `)
      }
      // ночник
      const data = await Devices.getStatus(userId)
      return { success: true, type: 'status', data, userId}
    } catch (e) {
      console.log(e)
      return null
    }
  }
  async confirmGuard(id, status) {
    const query = `UPDATE stations SET guard = ${status} WHERE id = ${id}`
    const resp = await db.query(query).catch(()=>{})
    return { success: !!resp, guard: !!resp ? status : undefined }
  }

  async connect(key) {
    const query = `SELECT id FROM stations WHERE secret_key = '${key}' AND NOT activated`
    const ids = await db.query(query).catch((e) => { console.log(e) })
    if (!ids?.rows[0]) return null
    const id = ids?.rows[0].id
    const queryActivate = `UPDATE stations SET activated = true WHERE id = ${id}`
    const success = await db.query(queryActivate).catch((e) => { console.log(e) })
    return success ? { topic: key, id } : null
  }

  async getKey(req, res) {
    const key = Math.random().toString(32).substring(2, 7)
    const query = `
    INSERT INTO stations (secret_key, user_id, last_update)
    VALUES
    ('${key}', ${req.user.id}, NOW())`
    const success = await db.query(query).catch((e) => { console.log(e) })
    res.json({ success: !!success, data: success ? {key} : null})
  }
}

module.exports = new DeviceControllers()