
const WebSocket = require('ws');
// const fs = require('fs');
const https = require('http');
const Datastore = require('nedb');

let datajs;
const db = new Datastore({filename : 'db'});
db.loadDatabase();

// const server = https.createServer({
//     cert: fs.readFileSync('./domain.pem'),
//     key: fs.readFileSync('./rootCA.key')
//   }, (req, res) => {
//     console.log("Request");
//     res.end("Nice");
//   });

const port = 8800;
const wsServer = new WebSocket.Server({port: port});
const clients = {}

wsServer.on('connection', onConnect);

function onConnect(wsClient) {
    console.log("New client");
    intervalFunc()
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

console.log(`Сервер запущен на ${port} порту`);

function intervalFunc() {
    for (const id in clients) {
        datajs = require('./test.json');
        datajs["time"] += 1;
        clients[id].send(JSON.stringify(datajs))
        console.log("send data")
    }
}

// server.listen(port);

setInterval(intervalFunc, 10000);
