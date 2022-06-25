const test_data = require('../test_data.js')
const db = require('../db')
class DeviceControllers{

    async getStatus(id_user) {
        const station = (await db.query("SELECT * FROM stations WHERE user_id = $1", [id_user])).rows[0]
        if (station){
            const {id} = station
            const modules = await this.getModules(id)
            const rings = await this.getRings(null,id)
            station.modules = modules
            station.rings = rings
            if (Date.now() - station.last_update < 300000) {
                station.active = true
            } else {
                station.active = false
            }
            console.log(station)
            // await this.addModule(id_user, id, 123123, 1, 1284, '52%', 'Кухня', 'Влажность')
            // await this.addModule(id_user, id, 435345, 1, 1284, '24°C', 'Комната', 'Температура')
            // await this.addModule(id_user, id, 234234, 2, 1284, '', 'Прихожая', 'Движение')
            // await this.addModule(id_user, id, 456456, 3, 1284, '', 'Улица', 'Дверь')
        } else {
            return {error: 'Station not found'}
        }
        return station
        // return test_data
    }

    async addStation(id_user, secret_key) {
        try{
            const station = await db.query(`INSERT INTO stations (time, battery, lamp, user_id, guard, speaker, secret_key, last_update) VALUES (0, 0, 0, $1, false, 0, $2, NOW()) RETURNING *`,[id_user, secret_key])
            if (station) {
                return {
                    error: null,
                    message: "SUCCESS"
                }
            } else {
                return {error: "Server Error"}
            }
        } catch(e) {
            console.log(e)
            return {error: "Server Error"}
        }
    }



    async getRings(id_user, id_station) {
        let rings
        if (id_station) {
            rings = (await db.query("SELECT * FROM rings WHERE station_id = $1", [id_station])).rows[0]
        } else if(id_user) {
            rings = (await db.query("SELECT * FROM rings WHERE user_id = $1", [id_user])).rows[0]
        } else {
            rings = {error: "Server Error"}
        }
        if (rings) {
            return rings
        }
        return {}
    }

    async setBrightness(id_user) {

    }

    async setRing() {

    }

    async setStatus(status) {
        try{
            console.log(status)
            const {user_id, station_id} = db.query(
            `UPDATE stations
            SET time = $1,
                battery = $2,
                lamp = $3,
                last_update = NOW(),
                guard = $4,
                speaker = $5
            WHERE id = $6
            RETURNING user_id, station_id;`,
            [status.time,
            status.voltage,
            status.brightness,
            status.guard,
            status.speaker.volume,
            status.id]
            )
            const rings_id = db.query(`
                UPDATE rings
                SET active = false
                WHERE station_id = $1
                RETURNING id`,
                [station_id]
                )
            for (var i in status.rings) {
                db.query(`
                UPDATE rings 
                SET active = true,
                    time = $1,
                    sunrise = $2,
                    music = $3
                WHERE id = $4`,
                [status.rings[i].time,
                status.rings[i].sunrise,
                status.rings[i].music,
                rings_id[status.rings[i].id]]
                )
            }
            // ночник


        } catch(e) {
            consle.log(e)
        }
    }

    async getModules(id_station) {
        const modules = (await db.query(`SELECT * FROM modules WHERE station_id = $1`, [id_station])).rows
        if (modules) {
            modules.forEach((mod) => {
                if (Date.now()-mod.time < 3000) {
                    mod.active = true
                } else {
                    mod.active = false
                }
            })
            return modules
        }
        return {}
    }

    async addModule(user_id, station_id, id_module, type, time, value, location, name_module) {
        try{
            module = await db.query(
                'INSERT INTO modules (location, last_value, time, station_id, user_id, type, id_module, name) VALUES ($1,$2,NOW(),$3,$4,$5,$6,$7) RETURNING *',
                [location, value, station_id, user_id, type, id_module, name_module]
                )
            console.log(module)
            return module
        } catch(e) {
            console.log(e)
            return {error: 'Server Error'}
        }
    }

    

    async deleteModule(id_module) {
        try{
            await db.query("DELETE FROM modules WHERE id_module = $1", [id_module])
            return {error: null, message: 'Success'}
        } catch(e){
            console.log(e)
            return {error: 'Server Error'}
        }
    }

    async updateModule(id_module, type, value, time_update){
        const user_id = db.query(`
            UPDATE modules
            SET id_module = $1,
                type = $2,
                value = $3,
                time_update = $4
            RETURNING user_id
            `, [
                id_module,
                type,
                value,
                time_update
            ]
        )
        console.log(user_id)

    }

    async updateModules(status_message){
        console.log(status_message)
        for (let i in status_message) {
            await this.updateModule(status_message[i].id, status_message[i].type, status_message[i].value, status_message[i].time_update)
        }
    }
}

module.exports = new DeviceControllers()