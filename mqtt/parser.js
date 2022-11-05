const deviceControllers = require("../controllers/devices.js")
const moduleControllers = require('../controllers/modules')
const { getUserIdFromStationId } = require('../controllers/utils/utils') 

class MQTTRouters {

  async status(id, statusMessage) {
    console.log(`Message from station: ${id}`)
    const parseStatus = statusMessage.split(' ')
    const keyStations = parseStatus[0]

    if (!(await this.check_key(keyStations))) {
      return
    }
    
    const rings = []
    if (parseStatus[2] !== "0") {
      for (let i in parseStatus[2].split(',')) {
        const ring = {
          id: parseStatus[2].split(',')[i],
          time: parseStatus[3].split(',')[i],
          sunrise: (parseStatus[4].split(',')[i] === 'true'),
          music: parseStatus[5].split(',')[i]
        }
        rings.push(ring)
      }
    }
    const status = {
      id: id,
      brightness: parseStatus[1],
      nightlight: {
        active: (parseStatus[6] === 'true'),
        timeOn: parseStatus[7].split(',')[0],
        timeOff: parseStatus[7].split(',')[1]
      },
      speaker: {
        active: (parseStatus[8] === 'true'),
        volume: parseStatus[9]
      },
      rings,
      voltage: parseStatus[10],
      mode: parseStatus[11],
      time: parseStatus[12],
      guard: parseStatus[13] === 'true'
    }
    return await deviceControllers.setStatus(status)
  }

  async moduleMessage(idStation, statusMessage) {
    const parsemessage = statusMessage.trim().split(' ')
    if (parsemessage.length <= 2) {
      return
    }
    const keyStations = parsemessage[0]
    if (!(await this.check_key(keyStations))) {
      return
    }
    const count_modules = (parsemessage.length - 1) / 4
    const modules = []
    for (let i = 0; i < count_modules; i++) {
      const parseTime = async (time) => {
        time = Number(time)
        const now = new Date()
        const timeupd = {
          year: now.getFullYear(),
          month: now.getMonth(),
          day: now.getDate(),
          hour: Math.floor(time / (60 * 60)),
          minutes: Math.floor((time / 60) % 60),
          seconds: time % 60
        }
        const date = new Date(
          timeupd.year,
          timeupd.month,
          timeupd.day,
          timeupd.hour,
          timeupd.minutes,
          timeupd.seconds
        );
        return date.getTime()
      }
      const timeUpdate = await parseTime(parsemessage[i * 4 + 4])
      modules.push({
        id: parsemessage[i * 4 + 1],
        type: parsemessage[i * 4 + 2],
        value: parsemessage[i * 4 + 3],
        timeUpdate
      })
    }
    return await moduleControllers.updateModules(idStation, modules)
  }

  async guard(id, payload) {
    const parsemessage = payload.split(' ')
    if (!(await this.check_key(parsemessage[0]))) {
      return
    }
    return deviceControllers.confirmGuard(id, parsemessage[1] === '1')
  }

  async check_key(keyStations) {
    return true
  }

  async newStation(data) {
    const parsedData = data.split(' ')
    if (parsedData[0] === 'CT') {
      return deviceControllers.connect(parsedData[1])
    }
  }

  async alarm(id, payload) {
    const userId = await getUserIdFromStationId(id)
    const parsedMsg = payload.split(':')
    const text = `Сработал датчик ${parsedMsg[0]}`
    return {userId, text}
  }
}

module.exports = new MQTTRouters()


// 5715 0 1,3 835,1000 true,false 1,3 true 2330,730 false 55 720 1 1234 true
// SENS: 5715 154 1 12 15 153 2 13 15 153 10 0 15 153 11 0 15 153 20 0 15