'use strict'

const Sequelize = require('sequelize'); 
const env = require('../config/env');

const sequelize = new Sequelize(env.DATABASE_NAME, env.DATABASE_USERNAME, env.DATABASE_PASSWORD, {
    host: env.DATABASE_HOST,
    dialect: env.DATABASE_DIALECT,
    operatorsAliases: false,
  
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
  });

// Connect all the models/tables in the database to a db object, 
//so everything is accessible via one object
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

//Models/tables
db.users = require('../models/User.js')(sequelize, Sequelize);
db.transaction_history = require('../models/Transaction_History.js')(sequelize, Sequelize);
db.p2p_transfer = require('../models/P2PTransfer.js')(sequelize, Sequelize);

//Relations
db.transaction_history.belongsTo(db.users);
db.users.hasMany(db.transaction_history);

module.exports = db;
