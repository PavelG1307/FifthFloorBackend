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
    if (wsClient.id) {
      const i = this.wsClients[wsClient.id].indexOf(wsClient)
      if (i >= 0) {
        this.wsClients[wsClient.id].splice(i, 1)
      }
      console.log("Клиентов у пользователя: ", this.wsClients[wsClient.id].length)
    }
  }

  async onMessage(rawMessage, wsClient) {
    const message = JSON.parse(rawMessage)
    if ("token" in message) {
      const check = await checkToken(message.token)
      if (check && check.id) {
        const user = check.id
        console.log(`Новое подключение: ${user.id}`)
        wsClient.id = user.id
        if (this.wsClients[user.id]) {
          this.wsClients[user.id].push(wsClient)
        } else {
          this.wsClients[user.id] = [wsClient]
        }
        console.log("Клиентов у пользователя: ", this.wsClients[wsClient.id].length)
        wsClient.send(JSON.stringify({ success: true }))
      } else {
        wsClient.send(
          JSON.stringify({ success: false, message: "Токен не верен" })
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
