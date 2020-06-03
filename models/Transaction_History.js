// const Sequelize = require("sequelize")
// const db = require("../database/db")

// module.exports = db.sequelize.define(
//     'transaction_history',
//     {
//         email: {
//             type: Sequelize.STRING
//         },
//         date: {
//             type: Sequelize.DATE,
//             defaultValue: Sequelize.NOW
//         },
//         amount: {
//             type: Sequelize.FLOAT,
//             defaultValue: 0
//         },
//         description: {
//             type: Sequelize.STRING
//         },
//         status: {
//             type: Sequelize.STRING
//         },
//         main_balance: {
//             type: Sequelize.FLOAT,
//             defaultValue: 0
//         },
//     },
//     {
//         timestamps: false
//     },
// )

'use strict'

module.exports = (sequelize, DataTypes) => {
  const TransactionHistory = sequelize.define('transaction_history', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    amount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    description: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.STRING
    },
    main_balance: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    timestamps: false
  });
  return TransactionHistory;
};


