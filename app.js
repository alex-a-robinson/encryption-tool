var express = require('express')
var crypto   = require('crypto')
var app     = express()
var router  = express.Router()
var io      = require('socket.io').listen(app.listen(3000))

app.use('/', router)

router.route('/').get(function(req, res) {
    console.log('serving index.html')
    res.sendFile(__dirname + '/public/index.html')
})

io.on('connection', function(socket) {
    console.log('new connection')
    socket.on('hash-in', function(msg) {
        var data = msg[0]
        var type = msg[1]
        socket.emit('hash-out', crypto.createHash(type).update(data).digest('hex'))
    })
    
    socket.on('crypto-in', function(msg) {
        var data = msg[0]
        var pass = msg[1]
        var alg  = msg[2]
        var type = msg[3]

        var out = ''

        if (type == 'encrypt') {
            console.log('encrpting: ' + msg)
            var cipher = crypto.createCipher(alg, pass)
            console.log('cipher created')
            var out = cipher.update(data, 'binary', 'hex') + cipher.final('hex');
        } else {
            console.log('decrypting: ' + msg)
            var decipher = crypto.createDecipher(alg, pass);
            var out = decipher.update(data, 'hex', 'binary') + decipher.final('binary')
        }

        socket.emit('crypto-out', out)
    })
})
