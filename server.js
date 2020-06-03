var express = require("express")
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

//drop and resync with { force: true }
db.sequelize.sync().then(() => {
    app.listen(port, () => {
      console.log('Server is running on port:', port);
    });
  });
