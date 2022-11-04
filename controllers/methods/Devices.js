
const db = require('../../db/db')
const ModuleControllers = require('../modules.js')
const Rings = require('./Rings')

module.exports.getStatus = async (idUser) => {
    const station = (await db.query("SELECT * FROM stations WHERE user_id = $1 AND activated", [idUser])).rows[0]
    if (station) {
      const { id, last_update } = station
      const modules = await ModuleControllers.getModules(id)
      const rings = await Rings.getRings(id, true)
      station.modules = modules
      station.rings = rings
      station.active = Date.now() - last_update < 300000
      return station
    }
    return null
  }