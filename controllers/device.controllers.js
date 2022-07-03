const db = require('../db')
const emitter = require('../emitter.js')

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
            station.type = "status"
            console.log(station)
        } else {
            return {error: 'Station not found'}
        }
        return station
    }

    async addStation(id_user, secret_key) {
        console.log(`New stations: ${id_user}`)
        try{
            const station = await db.query(`INSERT INTO stations (time, battery, lamp, user_id, guard, speaker, secret_key, last_update) VALUES (0, 0, 0, $1, false, 0, $2, NOW()) RETURNING *`,[id_user, secret_key])
            console.log(station)
            if (station) {
                for (let i = 0; i<5; i++){
                    await db.query(`INSERT INTO rings (name, time, active, visible, sunrise, music, user_id, station_id) VALUES ('ring', 0, false, false, true, 0, $1, $2)`,[id_user, station.id])
                }
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


    async setBrightness(id_user, brightness) {
        const default_bright = 7
        const station_id = await this.getStationIdFromUserId(id_user)
        const bright_value = brightness? default_bright : 0
        emitter.eventBus.sendEvent('Updated brightness', station_id, bright_value);
        return {error: null}
    }


    async setRing() {

    }


    async setStatus(status) {
        try{
            console.log(status)
            const user_id = (await db.query(
            `UPDATE stations
            SET time = $1,
                battery = $2,
                lamp = $3,
                last_update = NOW(),
                guard = $4,
                speaker = $5
            WHERE id = $6
            RETURNING user_id;`,
            [status.time,
            status.voltage,
            status.brightness,
            status.guard,
            status.speaker.volume,
            status.id]
            )).rows[0].user_id
            const rings_id = (await db.query(`
                with updated as (
                    UPDATE rings
                    SET active = false
                    WHERE user_id = $1
                    RETURNING id
                )
                SELECT *
                FROM updated
                ORDER BY id ASC;`,
                [user_id]
                )).rows

            for (let i in status.rings) {
                await db.query(`
                UPDATE rings 
                SET active = true,
                    time = $1,
                    sunrise = $2,
                    music = $3
                WHERE id = $4
                `,
                [status.rings[i].time,
                status.rings[i].sunrise,
                status.rings[i].music,
                rings_id[status.rings[i].id].id - 1]
                )
            }
            // ночник
            emitter.eventBus.sendEvent('Updated status', user_id);
        } catch(e) {
            console.log(e)
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


    async updateModule(id_module, type, value, time_update, station_id){
        try{
            const id = await db.query(`
                    INSERT INTO modules (
                        id_module,
                        type,
                        last_value,
                        time,
                        location,
                        name,
                        station_id)
                    VALUES 
                        ($1,
                        $2,
                        $3,
                        NOW(),
                        'room',
                        'modules',
                        $4)
                    ON CONFLICT (id_module) DO UPDATE
                    SET id_module = $1,
                        type = $2,
                        last_value = $3,
                        time = NOW()
                `, [
                    id_module,
                    type,
                    value,
                    station_id
                ]
            )
        } catch(e) {
            console.log(e)
        }

    }


    async updateModules(station_id, status_message){
        console.log(status_message, station_id)
        for (let i in status_message) {
            const {id, type, value, time_update} = status_message[i]
            await this.updateModule(id, type, value, time_update, station_id)
        }
        try{
            const user_id = await this.getUserIdFromStationId(station_id)
            emitter.eventBus.sendEvent('Updated status',user_id);
        } catch(e){
            console.log(e)
        }
    }

    async getUserIdFromStationId(id){
        return (await db.query(`SELECT user_id FROM stations WHERE id = $1`,[id])).rows[0].user_id
    }

    async getStationIdFromUserId(id){
        return (await db.query(`SELECT id FROM stations WHERE user_id = $1`,[id])).rows[0].id
    }
}
const deviceControllers = new DeviceControllers()
module.exports = {deviceControllers, emitter}