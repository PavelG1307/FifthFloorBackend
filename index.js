
const WebSocket = require('ws');
const datajs = require('./test.json')
const Datastore = require('nedb');

const db = new Datastore({filename : 'db'});
db.loadDatabase();

const wsServer = new WebSocket.Server({port: 8800});
const clients = {}

wsServer.on('connection', onConnect);

function onConnect(wsClient) {
    console.log("New client");

    wsClient.on('message', function(rawMessage) {
        console.log('received: %s', rawMessage);
        try {
            const message = JSON.parse(rawMessage);
            db.find({tokken: message.tokken}, function (err, docs) {
                console.log(docs.length)
                if (docs.length > 0) {
                    const id = docs[0]["_id"];
                    console.log(id);
                    clients["id"] = wsClient;
                } else{
                    db.insert({tokken : message.tokken});
                }
            });
        } catch (error) {
            console.log('Ошибка', error);
        }
    })

    wsClient.on('close', function() {
    console.log('Пользователь отключился');
    })
}

console.log('Сервер запущен на 9000 порту');

function intervalFunc() {
    for (const id in clients) {
        datajs["time"] += 1;
        clients[id].send(JSON.stringify(datajs))
        console.log("send data")
    }
}
  
setInterval(intervalFunc, 5000);