const {routerClass, emitter} = require('./test1.js')
emitter.eventBus.on('response', function(data) {
    console.log(data)
})

setTimeout(()=>{routerClass.test()}, 1500)
