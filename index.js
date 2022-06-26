const WebSocket = require('ws');
const {checkToken} = require('./authControl.js');
const UserControllers = require('./controllers/user.controllers.js');
const {deviceControllers} = require('./controllers/device.controllers.js');
const {mqttServer, emitter} = require('./mqtt.js')
const port = 8080;
const wsServer = new WebSocket.Server({port: port});
wsServer.on('connection', onConnect);

function onConnect(wsClient) {
    console.log("New client");
    emitter.eventBus.on('getInfoFromBD 1', async function (){
        wsClient.send(JSON.stringify(await deviceControllers.getStatus(user.id)))
        // console.log('update Status 1 ws')
    })

    wsClient.on('message', async function(rawMessage) {
        let message = JSON.parse(rawMessage)
        res = await answer(message)
        wsClient.send(JSON.stringify(res))
    })

    wsClient.on('close', function() {
        console.log('Пользователь отключился');
    })
}


async function answer(message) {
    const {token, type} = message
    user = await checkToken(token)
    if (!user && type != "SIGN IN" && type != "REGISTRATION") {
        return {error: "Token invalid"}
    } else {
        switch (type) {
            case "CONNECTED":
                return await deviceControllers.getStatus(user.id)

            case "SIGN IN":
                return await UserControllers.getUser(message.login, message.password)

            case "REGISTRATION":
                return await UserControllers.createUser(message.login, message.password, message.email, message.phone_number)
            
            case "GET STATUS":
                return await deviceControllers.getStatus(user.id)
            
            case "ADD STATION":
                return await deviceControllers.addStation(user.id, message.key)
            default:
                return {error: "Bad request"}
        }
    }
}

wsServer.on('listening', () => {console.log(`Сервер запущен на ${port} порту`)});
mqttServer.runMQTT()