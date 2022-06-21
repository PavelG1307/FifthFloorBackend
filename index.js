const WebSocket = require('ws');
const UserControllers = require('./controllers/user.controllers.js');
const port = 8080;
const wsServer = new WebSocket.Server({port: port});

wsServer.on('connection', onConnect);

function onConnect(wsClient) {
    console.log("New client");

    wsClient.on('message', async function(rawMessage) {
        let message = JSON.parse(rawMessage)
        let {type} = message
        console.log('received: ', message);
        switch (type) {

            case "CONNECTED":
                console.log("Connected")
                break

            case "SIGN IN":
                res = await UserControllers.getUser(message.login, message.password)
                wsClient.send(JSON.stringify(res))
                break

            case "REGISTRATION":
                res = await UserControllers.createUser(message.login, message.password)
                wsClient.send(JSON.stringify(res))
                break
                
            default:
                console.log('error')
        }
    })

    wsClient.on('close', function() {
        console.log('Пользователь отключился');
    })
}

wsServer.on('listening', () => {console.log(`Сервер запущен на ${port} порту`)});