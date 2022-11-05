const db = require("../db/db")
const utils = require('./utils/utils.js')
const Devices = require('./methods/Devices')
const Modules = require('./methods/Modules')

class ModuleControllers {
  async add(
    user_id,
    station_id,
    id_module,
    type,
    time,
    value,
    location,
    name_module
  ) {
    try {
      module = await db.query(
        "INSERT INTO modules (location, last_value, time, station_id, user_id, type, id_module, name) VALUES ($1,$2,NOW(),$3,$4,$5,$6,$7) RETURNING *",
        [location, value, station_id, user_id, type, id_module, name_module]
      );
      return module;
    } catch (e) {
      console.log(e);
      return { error: "Server Error" };
    }
  }
  async set(req, res) {
    const { id, state } = req.body
    const idUser = req.user.id
    const stationId = await utils.getStationIdFromUserId(idUser)
    const success = await req.mqtt.send(stationId, 'remote', `MDL ${id} ${state}`)
    res.json({ success })
  }
  async delete(req, res) {
    const idModule = req.body.idModule
    try {
      await db.query("DELETE FROM modules WHERE id_module = $1", [idModule])
      res.json({ success: true })
    } catch (e) {
      console.log(e);
      res.json({ success: true, message: "Ошибка на сервере" })
    }
  }
  async updateName(req, res) {
    const { id, name, location, actions } = req.body
    try {
      let acts
      if (actions[0]) {
        acts = "ARRAY['" + actions.map(el => JSON.stringify(el)).join("'::json, '") + "'::json]"
        let reqMqtt = 'rules'
        for (const i in actions) {
          reqMqtt += ('000' + id).slice(-4)
          reqMqtt += ( '0' + actions[i].condition).slice(-1)
          reqMqtt += ('000' + actions[i].value).slice(-4)
          reqMqtt += ('000000' + actions[i].target_module).slice(-6)
        }
        const idUser = req.user.id
        const stationId = await utils.getStationIdFromUserId(idUser);
        const success = await req.mqtt.send(stationId, 'remote', reqMqtt)
      }
      else acts = 'null'
      const query = `
      UPDATE modules
      SET
        name = '${name}',
        location = '${location}',
        actions = ${acts}
      WHERE id_module = ${id}`
      const resp = await db.query(query).catch(e=>{console.log(e)})
      res.json({ success: !!resp })
    } catch (e) {
      console.log(e);
      res.json({ success: false })
    }
  }
  async updateModule(
    idModule,
    type,
    value,
    timeUpdate,
    stationId,
    userId,
    name = "",
    location = ""
  ) {
    try {
      const query = `
                  INSERT INTO modules (
                    id_module, type,last_value,
                    time, location, name, station_id, user_id
                  ) VALUES 
                    (${idModule}, '${type}',
                    '${value}', to_timestamp(${timeUpdate} / 1000.0), 'Комната',
                    'Модуль',  ${stationId}, ${userId})
                  ON CONFLICT (id_module) DO UPDATE
                  SET id_module = ${idModule},
                      type = ${type},
                      last_value = ${value},
                      time = to_timestamp(${timeUpdate} / 1000.0)
                      ${ name ? `, name = '${name}'` : ''}
                      ${ location ? `, location = '${location}'` : ''},
                      user_id = ${userId}
                    `
      const id = await db.query(query)
    } catch (e) {
      console.log(e);
    }
  }
  async updateModules(stationId, statusMessage) {
    const userId = await utils.getUserIdFromStationId(stationId);
    for (let i in statusMessage) {
      const { id, type, value, timeUpdate } = statusMessage[i];
      await this.updateModule(id, type, value, timeUpdate, stationId, userId);
    }
    try {
      // const data = await Devices.getStatus(userId)
      const data = await Devices.getStatus(userId)
      return { success: true, type: 'status', data, userId}
    } catch (e) {
      console.log(e);
    }
  }
  async get(req, res) {
    const userId = req.user.id
    const modules = await Modules.getModules({userId})
    res.json({ success: true, data: modules })
  }
  async getOne(req, res) {
    const query = `
    SELECT location, last_value, m.name, m.time, m.actions,
      id_module, t.name as type,  t.image, t.units, t.value_type, t.type as mode
    FROM modules AS m
    JOIN stations as s on m.station_id = s.id
    JOIN module_types AS t ON m.type = t.type_id
    WHERE m.id_module = ${req.params.id} and s.user_id = ${req.user.id}`
    const resp = await db.query(query).catch(()=>{})
    if (resp && resp.rows[0]) {
      const actions = await Modules.getActions(req.user.id)
      res.json({success: true, data: resp.rows[0], actions})
    } else {
      res.json({ success: false, message: 'Модуль не найден'})
    }
  }
}

module.exports = new ModuleControllers();
