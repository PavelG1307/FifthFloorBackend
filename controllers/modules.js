const db = require("../db/db")
const utils = require('./utils/utils.js')
const Devices = require('./methods/Devices')

class ModuleControllers {

  async getModules(id_station) {
    const modules = (
      await db.query(`SELECT * FROM modules WHERE station_id = $1`, [
        id_station,
      ])
    ).rows;
    if (modules[0]) {
      modules.forEach((mod) => {
        if (mod.type < 10) {
          mod.active = true;
        } else if (mod.type < 20) {
          mod.active = mod.last_value === "0";
        } else {
          mod.active = mod.last_value !== "0";
        }
        mod.active = Date.now() - mod.time < 60000;
      });
      return modules;
    }
    return {};
  }
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
      console.log(module);
      return module;
    } catch (e) {
      console.log(e);
      return { error: "Server Error" };
    }
  }
  async set(req, res) {
    const { idModule, state } = req.body
    const idUser = req.user.id
    const stationId = await this.getStationIdFromUserId(idUser);
    const success = await req.mqtt.send(stationId, 'remote', `MDL ${idModule} ${state}`)
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
    const { idModule, name_module, location } = req.body
    try {
      const query = `
      UPDATE modules
      SET
        name = ${name_module},
        location = ${location}
      WHERE id_module = ${idModule}`
      await db.query(query)
      res.json({ success: true })
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
    name = "",
    location = ""
  ) {
    try {
      const query = `
                  INSERT INTO modules (
                    id_module, type,last_value,
                    time, location, name, station_id
                  ) VALUES 
                    (${idModule}, '${type}',
                    '${value}', NOW(), 'Комната',
                    'Модуль',  ${stationId})
                  ON CONFLICT (id_module) DO UPDATE
                  SET id_module = ${idModule},
                      type = ${type},
                      last_value = ${value},
                      time = NOW()
                      ${ name ? `, name = '${name}'` : ''}
                      ${ location ? `, location = '${location}'` : ''}
                    `
                    console.log(query)
      const id = await db.query(query)
    } catch (e) {
      console.log(e);
    }
  }
  async updateModules(stationId, statusMessage) {
    console.log(statusMessage);
    for (let i in statusMessage) {
      const { id, type, value, timeUpdate } = statusMessage[i];
      await this.updateModule(id, type, value, timeUpdate, stationId);
    }
    try {
      const userId = await utils.getUserIdFromStationId(stationId);
      const data = await Devices.getStatus(userId)
      return { success: true, type: 'status', data, userId}
    } catch (e) {
      console.log(e);
    }
  }
  
}

module.exports = new ModuleControllers();
