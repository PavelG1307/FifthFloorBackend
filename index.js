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
        let message = JSON.parse(rawMessage)
        res = await answer(wsClient, message)
        wsClient.send(JSON.stringify(res))
    })

    wsClient.on('close', function() {
        console.log('Пользователь отключился');
    })
}


async function answer(ws, message) {
    const {token, type} = message
    user = await checkToken(token)
    if (!user && type != "SIGN IN" && type != "REGISTRATION") {
        return {error: "Token invalid"}
    } else {
        switch (type) {
            case "CONNECTED":
                if (WSClients[user.id]) {
                    WSClients[user.id].push(ws)
                } else {
                    WSClients[user.id] = [ws]
                }
                return await deviceControllers.getStatus(user.id)

            case "SIGN IN":
                return await UserControllers.getUser(message.login, message.password)

            case "REGISTRATION":
                return await UserControllers.createUser(message.login, message.password, message.email, message.phone_number)
            
            case "GET STATUS":
                return await deviceControllers.getStatus(user.id)
            
            case "ADD STATION":
                return await deviceControllers.addStation(user.id, message.key)
            case "SET BRIGHTNESS":
                console.log(message)
                return await deviceControllers.setBrightness(user.id, message.brightness)
            default:
                return {error: "Bad request"}
        }
    }
}

emitter.eventBus.on('Updated status', 
    async function (id){
        try {
            if (WSClients[user.id]) {
            // const data = JSON.stringify(await deviceControllers.getStatus(id))
            WSClients[id].forEach((ws) => {
                console.log(ws)
            //     send(data)
            })
            }
        } catch (e) {
            WSClients[id].send(JSON.stringify({error: "Error on server"}))
            console.log(e)
        }
    }
)

wsServer.on('listening', () => {console.log(`Сервер запущен на ${port} порту`)});
mqttServer.runMQTT()