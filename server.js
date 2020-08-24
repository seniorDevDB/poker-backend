var express = require("express")
// var socketIo = require("socket.io")
var cors = require("cors")
var bodyParser = require("body-parser")
var morgan = require('morgan')
db = require('./database/db.js')
env = require('./config/env')
router = require('./routes')


var app = express()
var port = process.env.PORT || 5000

app.use(morgan('combined'));
app.use(bodyParser.json())
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))

// var Users = require('./routes/Users')

// app.use('/users', Users)

router(app, db);


const http = require('http').Server(app);

// sockets array
global.sockets = [];



//drop and resync with { force: true }
db.sequelize.sync().then(() => {
    http.listen(port, () => {
      console.log('Server is running on port:', port);
    });

    let io = require('socket.io')(http);
    io.on('connection', function (socket) {
      console.log("I am socket!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", socket.email);
      socket.on('subscribe', async (data) => {
        // Set socket email and push it in 'sockets' array
        const isExisting = global.sockets.findIndex(
          (iSocket) => iSocket.email == data.email
        );
        //no user
        if (isExisting > -1) {
          global.sockets[isExisting].emit('logout');
          global.sockets.splice(isExisting, 1);
        }
    
        socket.email = data.email;
        global.sockets.push(socket);
        console.log("-----------------------------New coket!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", socket, socket.email);
    
      });
    
      // on disconnect, remove connected socket
      socket.on('disconnected', () => {
        global.sockets.splice(global.sockets.indexOf(socket), 1);
        socket.disconnect(true);
      });
    });

  });
