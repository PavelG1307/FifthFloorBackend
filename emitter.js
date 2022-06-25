const {EventEmitter} = require('events')
const eventEmitter = new EventEmitter()

class Event_class {
    async on(event, func) {
        eventEmitter.on(event, func)
    }

    async emit(event, ...arg) {
        eventEmitter.emit(event, ...arg)
    }
}

module.exports = eventEmitter