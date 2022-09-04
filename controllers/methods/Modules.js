
const db = require('../../db/db')

module.exports.getActions = async (user) => {
    const query = `
    SELECT m.name,  id_module, t.value_type, a.name as action_type,
       a.action_true, a.action_false, a.id as action_id
    FROM modules AS m
    JOIN stations as s on m.station_id = s.id
    JOIN module_types AS t ON m.type = t.type_id
    JOIN actions AS a ON ARRAY[a.id] && t.actions
    WHERE s.user_id = ${user}`
    console.log(query)
    const resp = await db.query(query).catch(()=>{})
    if (resp.rows) {
      return resp.rows
    } else {
      return []
    }
  }