var net = require('net');
var firmata = require('firmata');
var express = require('express');
var app = express();
var io = require('socket.io');
var five = require('johnny-five');
//Setting the path to static assets
app.use(express.static(__dirname + '/app'));
app.set('port', (process.env.PORT || 3000));
//For avoidong Heroku $PORT error
app.get('/', function(request, response) {
    var result = 'App is running local'
    response.send(result);
}).listen(app.get('port'), function() {
    console.log('App is running, server is listening on port ', app.get('port'));
});
//Serving the static HTML file
app.get('/', function (res) {
    res.sendFile('/index.html')
});
var options = {
  host: '201.27.180.48',  //whatever host
  port: 8080  //some port
};
var client = net.connect(options, function() { //'connect' listener
  console.log('connected to server!');
  
  var socketClient = this;
  //we can use the socketClient instead of a serial port as our transport
  var io = new firmata.Board(socketClient);
  io.once('ready', function(){
    console.log('io ready');
    io.isReady = true;
    var board = new five.Board({io: io, repl: true});
    board.on('ready', function(){
      console.log('five ready');
      var speed = 100, commands, motors;
    motors = {
        a: new five.Motor({
            pins: { pwm: 11 },
            register: { data: 8, clock: 4, latch: 12 },
            bits: { a: 2, b: 3 }
        }),
        b: new five.Motor({
            pins: { pwm: 3 },
            register: { data: 8, clock: 4, latch: 12 },
            bits: { a: 1, b: 4 }
        }),
        c: new five.Motor({
            pins: { pwm: 6 },
            register: { data: 8, clock: 4, latch: 12 },
            bits: { a: 5, b: 7 }
        }),
        d: new five.Motor({
            pins: { pwm: 5 },
            register: { data: 8, clock: 4, latch: 12 },
            bits: { a: 0, b: 6 }
        })
    };
    commands = null;
    io.on('connection', function (socket) {
        socket.on('stop', function () {
            motors.a.stop();
            motors.b.stop();
            motors.c.stop();
            motors.d.stop();
        });
        socket.on('start', function () {
            motors.a.fwd(speed);
            motors.b.fwd(speed);
            motors.c.fwd(speed);
            motors.d.fwd(speed);
        });
        socket.on('reverse', function () {
            motors.a.rev(speed);
            motors.b.rev(speed);
            motors.c.rev(speed);
            motors.d.rev(speed);
        });
        socket.on('left', function () {
            motors.a.rev(speed);
            motors.b.rev(speed);
            motors.c.fwd(speed);
            motors.d.fwd(speed);
        });
        socket.on('right', function () {
            motors.a.fwd(speed);
            motors.b.fwd(speed);
            motors.c.rev(speed);
            motors.d.rev(speed);
        });
    });
  });
 });
});