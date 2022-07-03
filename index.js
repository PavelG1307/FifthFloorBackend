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
        const result = await answer(wsClient, message)
        if (result) {
            if (result.id) {
                wsClient.id = result.id
                console.log('ID: ', wsClient.id)
                if (WSClients[user.id]) {
                    WSClients[result.id].push(this)
                } else {
                    WSClients[result.id] = [this]
                }
                console.log('Клиентов у пользвателя: ', WSClients[result.id].length)
            }

            wsClient.send(JSON.stringify(result.data))
        }
    })

    wsClient.on('close', function(ws) {
        console.log(ws)
        console.log(wsClient.id)
        // console.log(wsClient.id)
        console.log('Пользователь отключился');
        if (this.id) {
            i = WSClients[this.id].indexOf(this);
            if(i >= 0) {
                WSClients[this.id].splice(i,1);
            }
            console.log('Клиентов у пользвателя: ', WSClients[this.id].length)
        }
    })
}


async function answer(ws, message) {
    const {token, type} = message
    user = await checkToken(token)
    let data
    let id
    if (!user && type != "SIGN IN" && type != "REGISTRATION") {
        data = {error: "Token invalid"}
    } else {
        switch (type) {
            case "CONNECTED":
                id = user.id
                data = await deviceControllers.getStatus(user.id)
                break

            case "SIGN IN":
                data = await UserControllers.getUser(message.login, message.password)
                break

            case "REGISTRATION":
                data = await UserControllers.createUser(message.login, message.password, message.email, message.phone_number)
                break

            case "GET STATUS":
                data = await deviceControllers.getStatus(user.id)
                break

            case "ADD STATION":
                data = await deviceControllers.addStation(user.id, message.key)
                break

            case "SET BRIGHTNESS":
                data = await deviceControllers.setBrightness(user.id, message.brightness)
                break

            case "SET SPEAKER":
                data = await deviceControllers.setSpeaker(user.id, message.volume)
                break

            case "SET MODULE":
                data = await deviceControllers.setModule(user.id, message.module, message.state)
                break

            case "UPDATE MODULE":
                data = await deviceControllers.updateModuleName(message.module, message.name, message.location)
                break
            case "DELETE MODULE":
                data = await deviceControllers.deleteModule(message.module)
                break
            
            case "GUARD":
                data = await deviceControllers.changeGuard(user.id, message.state)
                break

            default:
                data = {error: "Bad request"}
                break
        }
        return {id, data}
    }
}


emitter.eventBus.on('Updated guard', 
    async function (id, state){
        try {
            const data = JSON.stringify({
                type: "guard",
                message: "Success",
                state: state
            })

            WSClients[id].forEach((ws) => {
                ws.send(data)
            })
        } catch (e) {
            console.log(e)
        }
})

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