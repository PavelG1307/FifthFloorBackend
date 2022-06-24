const mqtt = require('mqtt')
const DeviceControllers = require('./controllers/device.controllers.js');
const MQTTRouters = require('./routers/mqtt.routers.js')

const host = 'localhost'
const port = '1883'
const clientId = `Server`
const connectUrl = `mqtt://${host}:${port}`

stations_id = ['1232', '23223', '23121']

const client = mqtt.connect(connectUrl, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: 'admin',
  password: 'root',
  reconnectPeriod: 1000,
})

const topic = `/${clientId}/status`

client.on('connect', () => {
  console.log('Connected')
  for (i in stations_id) {
        const topic = stations_id[i] + '/status'
        client.subscribe([topic], () => {
        console.log(`Subscribe to topic ${topic}`)
      })
  }
  

//   client.publish(topic, 'nodejs mqtt test', { qos: 0, retain: false }, (error) => {
//     if (error) {
//       console.error(error)
//     }
//   })
})


client.on('message', onMessage)


async function onMessage(topic, payload){
    
    const id = topic.split('/')[0]
    const endpoint = topic.split('/')[1]

    switch(endpoint) {
        case 'status':
            await MQTTRouters.ParseStatus(id, payload.toString())
        case 'module':
            await MQTTRouters.ParseModuleMessage(id, payload.toString())
    }
  console.log('Received Message:', topic, payload.toString())
}

