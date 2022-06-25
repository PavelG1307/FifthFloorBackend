const mqtt = require('mqtt')
const MQTTRouters = require('./routers/mqtt.routers.js')
MQTTRouters.DeviceControllers = DeviceControllers

class MQTTServer {
    
  async runMQTT (host = 'localhost', port = '1883', clientId = `Server`) {
    console.log('run')
    const connectUrl = `mqtt://${host}:${port}`
    const stations_id = ['3', '23223', '23121']
    const client = mqtt.connect(connectUrl, {
      clientId,
      clean: true,
      connectTimeout: 4000,
      username: 'fifthfloor',
      password: 'root',
      reconnectPeriod: 1000,
    })

    const subtopic = ['/status', '/modules']

    client.on('connect', () => {
      console.log('Connected')
      for (let j in subtopic) {
        for (let i in stations_id) {
                const topic = stations_id[i] + subtopic[j]
                client.subscribe([topic], () => {
                console.log(`Subscribe to topic ${topic}`)
            })
        }
      }
      

    //   client.publish(topic, 'nodejs mqtt test', { qos: 0, retain: false }, (error) => {
    //     if (error) {
    //       console.error(error)
    //     }
    //   })
    })

    client.on('message', await this.onMessage)
  }


  async onMessage(topic, payload){

      const id = topic.split('/')[0]
      const endpoint = topic.split('/')[1]

      switch(endpoint) {
          case 'status':
              await MQTTRouters.ParseStatus(id, payload.toString())
              break
          case 'modules':
              await MQTTRouters.ParseModuleMessage(id, payload.toString())
              break
      }
    console.log('Received Message:', topic, payload.toString())
  }

}

module.exports = new MQTTServer()