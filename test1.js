const {deviceClass, emitter} = require('./test2.js')
console.log('Run1 module')

// const emitter = require('./emitter.js')


// var Test = function() {
//     emitter.eventBus.sendEvent('response', 'test')
// }

class RouterClass{
    test(){
        deviceClass.test()
    }
}

routerClass = new RouterClass()

module.exports = {routerClass, emitter}