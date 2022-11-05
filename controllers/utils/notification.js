const axios = require('axios')
const User = require('../users')
class Notification {
  constructor(socket) {
    this.socket = socket
  }
  async alarm({ userId, text }) {
    this.pushInSocket({ userId, text, alarm: true })
    this.push({ userId, text, alarm: true })
  }
  async pushInSocket({ userId, text, alarm }) {
    this.socket.send({ text, alarm, type: 'notification' }, userId)
  }
  async push({ userId, text, alarm }) {
    const token = process.env.pushKey
    const registration_ids = await User.getPushTokens(userId)
    if (!(registration_ids && registration_ids[0])) return
    const data = {
      notification: {
        title: alarm ? "Тревога!" : "Уведомление",
        body: text,
        icon: "https://fifthfloor.site/lk/assets/src/img/favicon.png",
        click_action: "https://fifthfloor.site/"
      },
      registration_ids
    }
    axios({
      method: 'post',
      url: 'https://fcm.googleapis.com/fcm/send',
      data,
      headers: { Authorization: token },
    }).then(res => console.log(res.data.success ? 'Успех' : 'Ошибка')).catch(e => console.log(e));
    console.log(`Сделал ${alarm ? 'тревожное' : ''} push уведомление, пользователю ${userId}`)
  }
}

module.exports = Notification