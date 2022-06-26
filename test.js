const {routerClass, emitter} = require('./test1.js')
// var emitter = require('./emitter.js')
// console.log(mod1)
emitter.eventBus.on('response', function(data) {
    console.log(data)
})

setTimeout(()=>{routerClass.test()}, 1500)
