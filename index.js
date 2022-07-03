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
        const data = await answer(wsClient, message)

        if (data.id) {
            console.log('sfdsdfs')
            // wsClient.id = data.id
        }

        wsClient.send(JSON.stringify(data.data))
    })

    wsClient.on('close', function() {
        console.log('Пользователь отключился');
        if (wsClient.id) {
            WSClients[wsClient.id].splice(wsClient)
            console.log('array cleaned')
        }
    })
}


async function answer(ws, message) {
    const {token, type} = message
    user = await checkToken(token)
    const answer = {}
    if (!user && type != "SIGN IN" && type != "REGISTRATION") {
        answer.data = {error: "Token invalid"}
    } else {
        switch (type) {
            case "CONNECTED":
                if (WSClients[user.id]) {
                    WSClients[ws.id].push(ws)
                } else {
                    WSClients[ws.id] = [ws]
                }
                answer.data = await deviceControllers.getStatus(user.id)
                answer.id = user.id
                return answer

            case "SIGN IN":
                answer.data = await UserControllers.getUser(message.login, message.password)
                return answer

            case "REGISTRATION":
                answer.data = await UserControllers.createUser(message.login, message.password, message.email, message.phone_number)
                return answer

            case "GET STATUS":
                answer.data = await deviceControllers.getStatus(user.id)
                return answer

            case "ADD STATION":
                answer.data = await deviceControllers.addStation(user.id, message.key)
                return answer

            case "SET BRIGHTNESS":
                answer.data = await deviceControllers.setBrightness(user.id, message.brightness)
                return answer

            default:
                answer.data = {error: "Bad request"}
                return answer
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