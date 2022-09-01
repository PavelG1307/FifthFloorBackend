const WebSocket = require("ws")
const { checkToken } = require("../authControl.js")

class webSocket {
  constructor(server) {
    this.wsServer = new WebSocket.Server({ server })
    this.wsClients = {}
    this.wsServer.on("connection", ws => this.onConnect(ws))
    console.log("Вебсокет запущен")
  }

  onConnect(wsClient) {
    wsClient.on("message", message => this.onMessage(message, wsClient))
    wsClient.on("close", code => this.onClose(wsClient))
  }

  onClose(wsClient) {
    console.log("Пользователь отключился")
    if (this.id) {
      const i = this.wsClients[this.id].indexOf(wsClient)
      if (i >= 0) {
        this.wsClients[this.id].splice(i, 1)
      }
      console.log("Клиентов у пользователя: ", wsClients[this.id].length)
    }
  }

  async onMessage(rawMessage, wsClient) {
    const message = JSON.parse(rawMessage)
    if ("token" in message) {
      const user = await checkToken(message.token)
      if (user) {
        console.log(`Новое подключение: ${user.id}`)
        wsClient.id = user.id
        if (this.wsClients[user.id]) {
          this.wsClients[user.id].push(wsClient)
        } else {
          this.wsClients[user.id] = [wsClient]
        }
        console.log("Устройств у пользователя: ", this.wsClients[user.id].length)

        wsClient.send(JSON.stringify({ success: true }))
      } else {
        wsClient.send(
          JSON.stringify({ success: false, mesage: "Токен не верен" })
        )
      }
    }
  }

  async send(message, idUser) {
    if (idUser in this.wsClients) {
      this.wsClients[idUser].forEach( el => el.send(JSON.stringify(message)) )
    }
  }
}

module.exports = webSocket
