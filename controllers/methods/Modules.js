
const db = require('../../db/db')

module.exports.getActions = async (user) => {
    const query = `
    SELECT m.name,  id_module, t.value_type, a.type as action_type,
       a.action, a.id as action_id
    FROM modules AS m
    JOIN stations as s on m.station_id = s.id
    JOIN module_types AS t ON m.type = t.type_id
    JOIN actions AS a ON ARRAY[a.id] && t.actions
    WHERE s.user_id = ${user}
    ORDER BY id_module`
    console.log(query)
    const resp = await db.query(query).catch(()=>{})
    if (resp && resp.rows) {
      return resp.rows
    } else {
      return []
    }
  }

  module.exports.getModules = async ({userId, stationId}) => {
    if (!(userId || stationId)) return []
    const access = stationId ? `s.id = ${stationId}` : `s.user_id = ${userId}`
    const query = `
      SELECT location, last_value, m.name, m.time,
        id_module, t.name as type,  t.image, t.units, t.value_type, t.type as mode
      FROM modules AS m
      JOIN stations as s on m.station_id = s.id
      JOIN module_types AS t ON m.type = t.type_id
      WHERE ${access}
    `
    const modules = await db.query(query).catch(()=>{})
    if (!modules?.rows) return
    modules.rows.map( module => {
      const now = Date.now()
      const last_update = new Date(module.time)
      const maxDelay = 20000
      const diffTime = now - last_update.getTime()
      module.active =  diffTime < maxDelay
    })
    
    return modules?.rows ?? []
  }