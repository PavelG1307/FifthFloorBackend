const emitter = require('./emitter.js')
console.log('Run2 module')


class DeviceClass{
    async test(){
        emitter.eventBus.sendEvent('response', 'test')
    }
}

deviceClass = new DeviceClass()

module.exports = {deviceClass, emitter}