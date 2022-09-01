
const db = require('../../db/db')
const ModuleControllers = require('../modules.js')
const RingControllers = require('../rings.js')

module.exports.getStatus = async (idUser) => {
    const station = (await db.query("SELECT * FROM stations WHERE user_id = $1", [idUser])).rows[0]
    if (station) {
      const { id, last_update } = station
      const modules = await ModuleControllers.getModules(id)
      const rings = await RingControllers.getVisibleRings(null, id)
      station.modules = modules
      station.rings = rings
      station.active = Date.now() - last_update < 300000
      return station
    }
    return null
  }