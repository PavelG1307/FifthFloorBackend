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
    const idUser = req.user.id
    try {
      const station = (await db.query(`INSERT INTO stations (time, battery, lamp, user_id, guard, speaker, secret_key, last_update) VALUES (0, 0, 0, $1, false, 0, $2, NOW()) RETURNING *`, [idUser, key])).rows
      if (station[0]) {
        for (let i = 0; i < 5; i++) {
          await db.query(`INSERT INTO rings (name, time, active, visible, sunrise, music, user_id, station_id) VALUES ('ring', 0, false, false, true, 0, $1, $2)`, [idUser, station[0].id])
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
    const idUser = req.user.id
    const brightness = req.body.brightness || 0
    const stationId = await utils.getStationIdFromUserId(idUser)
    const success = await req.mqtt.send(stationId, 'remote', `BRT ${brightness}`)
    res.json({success})
  }
  async setSpeaker(req, res) {
    const idUser = req.user.id
    const volume = req.body.volume || 0
    const stationId = await utils.getStationIdFromUserId(idUser)
    const success = await req.mqtt.send(stationId, 'remote', `SPQ ${volume}`)
    res.json({ success })
  }
  async changeGuard(req, res) {
    const idUser = req.user.id
    const state = req.body.state ? 1 : 0
    const stationId = await utils.getStationIdFromUserId(idUser)
    const success = await req.mqtt.send(stationId, 'remote', `GRD ${state}`)
    res.json({success})
  }
  async getIds(callback) {
    return callback((await db.query(`SELECT id FROM stations`)).rows.map(el => el.id))
  }
  async setStatus(status) {
    try {
      const { time, voltage, brightness, guard, speaker, id} = status
      const query = `
        UPDATE stations
        SET time = ${time},
            battery = ${voltage},
            lamp = ${brightness},
            last_update = NOW(),
            guard = ${guard},
            speaker = ${speaker.volume}
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

}

module.exports = new DeviceControllers()