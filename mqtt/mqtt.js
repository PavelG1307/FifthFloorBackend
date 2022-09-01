const mqtt = require('mqtt')
const parser = require('./parser.js')
const deviceControllers = require('../controllers/devices')


class MQTTServer {
  constructor(websocket) {
    this.ws = websocket
    const host = process.env.NODE_ENV === 'development' ? process.env.mqttHost : 'localhost'
    const port = process.env.mqttPort || '1883'
    const clientId = process.env.mqttName || `Server`
    const username = process.env.mqttUsername || 'fifthfloor'
    const password = process.env.mqttPassword || 'root'
    const connectUrl = `mqtt://${host}:${port}`
    this.client = mqtt.connect(
      connectUrl, {
      clientId,
      clean: true,
      connectTimeout: 4000,
      username,
      password,
      reconnectPeriod: 1000,
    })

    this.client.on('connect', () => {
      console.log('Подключение с MQTT сервером установленно')
      const connectTopic = (ids) => {
        const subtopic = ['/stt', '/sens', '/guard']
        for (let j in subtopic) {
          for (let i in ids) {
            const topic = ids[i] + subtopic[j]
            this.client.subscribe([topic], () => {
              // console.log(`Подписался на ${topic}`)
            })
          }
        }
      }
      deviceControllers.getIds(connectTopic)
    })
    this.client.on('error', () => { console.log('Ошибка MQTT') })
    this.client.on('message', (topic, payload) => this.onMessage(topic, payload))
  }


  async onMessage(topic, payload) {

    const id = topic.split('/')[0]
    const endpoint = topic.split('/')[1]

    if (endpoint === 'stt') {
      const status = await parser.status(id, payload.toString())
      if (status) this.ws.send(status, status.userId)
      return
    } else if (endpoint === 'sens') {
      const status = await parser.moduleMessage(id, payload.toString())
      if (status) this.ws.send(status, status.userId)
      return
    } else if (endpoint === 'guard') {
      const status = await parser.guard(id, payload.toString())
      if (status) this.ws.send(status, status.userId)
      return
    }
    console.log('Received Message:', topic, payload.toString())
  }

  async send(idStation, topic, message) {
    const success = await this.client.publish(`${idStation}/${topic}`, message, { qos: 0, retain: false }, (error) => {
      if (error) { console.log(error) }
    })
    return success.connected
  }
}

module.exports = MQTTServer