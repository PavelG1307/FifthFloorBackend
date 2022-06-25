const Emitter = require('./emitter.js')

Emitter.on('help', (i,j) => {console.log('help' + i + j)})

Emitter.emit('help', 1234, 56)