var express = require('express')
var crypto   = require('crypto')
var app     = express()
var router  = express.Router()
var io      = require('socket.io').listen(app.listen(80))

app.use('/', router)

router.route('/').get(function(req, res) {
    res.sendFile(__dirname + '/public/index.html')
})

io.on('connection', function(socket) {
    socket.on('hash-in', function(msg) {
        var data = msg[0]
        var type = msg[1]

        if (['md5', 'md4', 'sha1', 'sha256', 'sha512'].indexOf(type) == -1) {
            socket.emit('hash-out', '**ERROR** No such algorithm')
            return
        }

        socket.emit('hash-out', crypto.createHash(type).update(data).digest('hex'))
    })
    
    socket.on('crypto-in', function(msg) {
        var data = msg[0]
        var pass = msg[1]
        var alg  = msg[2]
        var type = msg[3]

        var out = '**ERROR** An error occurred'

        if (['aes256', 'aes128', 'aes192', 'des', 'des3', 'rc4', 'rc2'].indexOf(alg) == -1) {
            socket.emit('crypto-out', '**ERROR** No such algorithm')
            return
        }

        if (pass == '') {
            socket.emit('crypto-out', '**WARNING** Password required')
            return
        }

        if (isNaN(parseInt(data, 16)) && type == 'decrypt') {
            socket.emit('crypto-out', '**WARNING** Hex input required')
            return
        }

        try {

            if (type == 'encrypt') {
                var cipher = crypto.createCipher(alg, pass)
                out = cipher.update(data, 'binary', 'hex') + cipher.final('hex');
            } else {
                var decipher = crypto.createDecipher(alg, pass);
                out = decipher.update(data, 'hex', 'binary') + decipher.final('binary')
            }
        } catch(err) {
            console.error(err)
        }

        socket.emit('crypto-out', out)
    })
})
