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
    socket.on('in', function(msg) {
        console.log('in: ' + msg)
        socket.emit('out', crypto.createHash('md5').update(msg).digest('hex'))
        console.log('out: ' + crypto.createHash('md5').update(msg).digest('hex'))
    })
})
