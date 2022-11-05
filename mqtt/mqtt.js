const mqtt = require('mqtt')
const parser = require('./parser.js')
const deviceControllers = require('../controllers/devices')
const Notification = require('../controllers/utils/notification')

class MQTTServer {
  constructor(websocket) {
    this.ws = websocket
    this.notification = new Notification(websocket)
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
      this.client.subscribe(['common'], () => {})
      const connectTopic = (ids) => {
        const subtopic = ['stt', 'sens', 'guard', 'alarm']
        for (let j in subtopic) {
          for (let i in ids) {
            const topic = ids[i] + '/' + subtopic[j]
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
    if (topic === 'common') {
      const data = await parser.newStation(payload.toString())
      if (data) this.send(null, data.topic, data.id.toString())
      return
    }
    const id = topic.split('/')[0]
    const endpoint = topic.split('/')[1]
    if (endpoint === 'stt') {
      const status = await parser.status(id, decrypt(payload.toString()))
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
    } else if (endpoint === 'alarm') {
      const data = await parser.alarm(id, payload.toString())
      this.notification.alarm(data)
    }
    console.log('Received Message:', topic, payload.toString())
  }

  async send(idStation, topic, message) {
    const topicName = idStation ? `${idStation}/${topic}` : topic
    const success = await this.client.publish(topicName, message, { qos: 0, retain: false }, (error) => {
      if (error) { console.log(error) }
    })
    return success.connected
  }
}

function xorCrypt (str, key) {
  let output = ''
  for (let i = 0; i < str.length; ++i) {
    output += String(key ^ str.charCodeAt(i))
    output += '.'
  }
  return output
}

const crypt = (data) => {
  const keyr = 88
  return xorCrypt(data, keyr) + keyr
}


const decrypt = (data) => {
  const splitData = data.split('.')
  let output = ""
  const key = splitData.at(-1)
  for (let i = 0; i < splitData.length - 1; i++) {
    output += String.fromCharCode(key ^ splitData[i])
  }
  return output
}


module.exports = MQTTServer