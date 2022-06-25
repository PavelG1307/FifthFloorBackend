const deviceControllers = require("../controllers/device.controllers.js")


class MQTTRouters {

    async ParseStatus(id, status_message){
        console.log(`Message from user: ${id}\nStatus: ${status_message}`)
        const parsestatus = status_message.split(' ')
        const key_stations = parsestatus[0]

        if (!(await this.check_key(key_stations))) {
            return
        }
        const status = {id: id}
        status.brightness = parsestatus[1]
        const rings = []
        for (let i in parsestatus[2].split(',')) {
            const ring = {
                id: parsestatus[2].split(',')[i],
                time: parsestatus[3].split(',')[i],
                sunrise: (parsestatus[4].split(',')[i] === 'true'),
                music: parsestatus[5].split(',')[i]
            }
            rings.push(ring)
        }
        status.rings = rings
        status.nightlight = {
            active: (parsestatus[6] === 'true'),
            timeOn: parsestatus[7].split(',')[0],
            timeOff: parsestatus[7].split(',')[1]
        }
        status.speaker = {
            active: (parsestatus[8] === 'true'),
            volume: parsestatus[9]
        }
        status.voltage = parsestatus[10]
        status.time = parsestatus[12]
        status.guard = (parsestatus[13] === 'true')
        deviceControllers.setStatus(status)
        // console.log(`Яркость: ${brightness}\nБудильники: ${JSON.stringify(rings)}\nНочник: ${JSON.stringify(nightlight)}\nКолонка: ${JSON.stringify(speaker)}\nНапряжение: ${voltage}\nВремя: ${time}`)
    }

    async ParseModuleMessage(id, status_message){
        const parsemessage = status_message.split(' ')
        const key_stations = parsemessage[0]
        if (!(await this.check_key(key_stations))) {
            return
        }
        const count_modules = (parsemessage.length-1)/4
        const modules = []
        console.log(count_modules)
        for (let i = 0; i < count_modules; i++) {
            modules.push({
                id: parsemessage[i * 4 + 1],
                type: parsemessage[i * 4 + 2],
                value: parsemessage[i * 4 + 3],
                time_update: parsemessage[i * 4 + 4]
            })
        }
        await deviceControllers.updateModules(modules)
    }

    async check_key(key_stations) {
        return true
    }
}

module.exports = new MQTTRouters()


// STT: 5715 0 1,3 835,1000 true,false 1,3 true 2330,730 false 55 720 1 1234 true
// SENS: 5715 154 1 12 15 153 2 13 15 153 10 0 15 153 11 0 15 153 20 0 15