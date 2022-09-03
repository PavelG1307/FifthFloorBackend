const db = require('../db/db')
const utils = require('./utils/utils.js')
const Rings = require('./methods/Rings')

class RingControllers {

  async editRing(req, res) {
    const { id, time, active, sunrise, music } = req.body
    const idUser = req.user.id
    try {
      const query = `UPDATE rings SET active = ${active}, time=${time}, sunrise = ${sunrise}, music = ${music}, visible = true WHERE id = ${id} and user_id = ${idUser} RETURNING *;`
      const updatedRing = await db.query(query).catch(()=>{})
      const successMqtt = await Rings.sendRings(req.mqtt, user)
      res.json({
        success: !!updatedRing.rows[0] && successMqtt,
        message: !updatedRing.rows[0] ? 'Будильник не найден' : null,
        data: updatedRing.rows[0] || {}
      })
    } catch (e) {
      res.json({
        success: false,
        message: 'Будильник не найден'
      })
    }
  }
  async setActiveRing(req, res) {
    try {
      const { id, state } = req.body
      const state_r = await Rings.changeActive(id, state, req.user.id, req.mqtt)
      res.json(state_r)
    } catch (e) {
      console.log(e)
      res.json({success: false, message: 'Ошибка на сервере'})
    }
  }
  async setVisibleRing(req, res) {
    try {
      const { id, state } = req.body
      const userId = req.user.id
      const updatedRing = await db.query(`UPDATE rings SET visible = ${state} WHERE id = ${id} and user_id = ${userId} RETURNING *;`,)
      res.json({success: true, message: updatedRing.rows})
    } catch (e) {
      res.json({success: false, message: 'Ошибка на сервере'})
    }
  }
  async getRings(req, res) {
    const rings = await Rings.getRings(req.user.id, req.query.visible, req.query.id)
    res.json({success: !!rings, data: rings})
  }

}

module.exports = new RingControllers()