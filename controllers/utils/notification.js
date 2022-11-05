class Notification {
    constructor(socket) {
        this.socket = socket
    }
    async alarm({userId, text}) {
        this.pushInSocket({userId, text, alarm: true})
        this.push({userId, text, alarm: true})
    }
    async pushInSocket({userId, text, alarm }) {
        this.socket.send({text, alarm, type: 'notification'}, userId)
    }
    async push({userId, text, alarm}) {
        console.log(`Сделаю ${ alarm ? 'тревожное' :  ''} push уведомление, пользователю ${userId}`)
        console.log(text)
    }
}

module.exports = Notification