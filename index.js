const WebSocket = require('ws');
const {checkToken} = require('./authControl.js');
const UserControllers = require('./controllers/user.controllers.js');
const {deviceControllers} = require('./controllers/device.controllers.js');
const {mqttServer, emitter} = require('./mqtt.js')
const port = 8080;
const wsServer = new WebSocket.Server({port: port});

const WSClients = {}
wsServer.on('connection', onConnect);

function onConnect(wsClient) {
    console.log("New client");

    wsClient.on('message', async function(rawMessage) {
        const message = JSON.parse(rawMessage)
        const {id, data} = await answer(wsClient, message)
        console.log(result)
        if (id) {
            console.log('ID: ', id)
            wsClient.id = id
        }

        wsClient.send(JSON.stringify(data))
    })

    wsClient.on('close', function(ws) {
        console.log(ws)
        console.log('Пользователь отключился');
        if (wsClient.id) {
            i = WSClients[wsClient.id].indexOf(wsClient);
            if(i >= 0) {
                WSClients[wsClient.id].splice(i,1);
            }
            console.log('array cleaned')
        }
    })
}


async function answer(ws, message) {
    const {token, type} = message
    user = await checkToken(token)
    const answ = {
        id: null,
    }
    if (!user && type != "SIGN IN" && type != "REGISTRATION") {
        answ.data = {error: "Token invalid"}
    } else {
        switch (type) {
            case "CONNECTED":
                if (WSClients[user.id]) {
                    WSClients[ws.id].push(ws)
                } else {
                    WSClients[ws.id] = [ws]
                }
                answ.data = await deviceControllers.getStatus(user.id)
                answ.id = user.id
                return answ

            case "SIGN IN":
                answ.data = await UserControllers.getUser(message.login, message.password)
                return answ

            case "REGISTRATION":
                answ.data = await UserControllers.createUser(message.login, message.password, message.email, message.phone_number)
                return answ

            case "GET STATUS":
                answ.data = await deviceControllers.getStatus(user.id)
                return answ

            case "ADD STATION":
                answ.data = await deviceControllers.addStation(user.id, message.key)
                return answ

            case "SET BRIGHTNESS":
                answ.data = await deviceControllers.setBrightness(user.id, message.brightness)
                return answ

            default:
                answ.data = {error: "Bad request"}
                return answ
        }
    }
}

emitter.eventBus.on('Updated status', 
    async function (id){
        try {
            if (WSClients[user.id]) {
            const data = JSON.stringify(await deviceControllers.getStatus(id))
            WSClients[id].forEach((ws) => {
                ws.send(data)
            })
            }
        } catch (e) {
            console.log(e)
        }
    }
)

wsServer.on('listening', () => {console.log(`Сервер запущен на ${port} порту`)});
mqttServer.runMQTT()