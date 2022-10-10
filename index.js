require('dotenv').config()
const MQTTServer  = require('./mqtt/mqtt.js')
const http = require("http")
const express = require("express")
const webSocket = require('./websoket/websoket.js')
const authRouter = require('./routers/auth.js')
const stationRouter = require('./routers/station.js')
const modulesRouter = require('./routers/modules.js')
const ringRouter = require('./routers/ring.js')

const db = require('./db/db')
db.query('SELECT 1+1').then(() => { console.log('База данных подключена') }).catch('Ошибка базы данных')

const port = process.env.PORT || 8080
const app = express()
const server = http.createServer(app)

const ws = new webSocket(server)
const mqtt = new MQTTServer(ws)
app.use(express.json({ limit: '50mb' }))

app.use(function (req, res, next) {
  req.mqtt = mqtt
  next()
})

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  res.header('X-Robots-Tag', 'noindex')
  if(req.method !== 'OPTIONS') console.log(`${req.method} ${req.hostname}${req.originalUrl}`)
  next()
})

app.use('/api/auth', authRouter)
app.use('/api/station', stationRouter)
app.use('/api/module', modulesRouter)
app.use('/api/ring', ringRouter)
app.use((error, req, res, next) => {
  console.log(error)
  console.log(error.message)
  res.status(400)
  res.json({
    success: false,
    message: req.app.get('env') === 'development' ? error.message : 'Неизвестная ошибка, обратитесь к администратору i@dxlebedev.ru'
  })
})






// emitter.eventBus.on('Updated guard',
//   async function (id, state) {
//     try {
//       const data = JSON.stringify({
//         type: "guard",
//         message: "Success",
//         state: state
//       })

//       WSClients[id].forEach((ws) => {
//         ws.send(data)
//       })
//     } catch (e) {
//       console.log(e)
//     }
//   })

// emitter.eventBus.on('Updated status',
//   async function (id) {
//     try {
//       if (WSClients[user.id]) {
//         const data = JSON.stringify(await deviceControllers.getStatus(id))
//         WSClients[id].forEach((ws) => {
//           ws.send(data)
//         })
//       }
//     } catch (e) {
//       console.log(e)
//     }
//   }
// )

server.listen(port, () => console.log(`Сервер запущен на ${port} порту`))
