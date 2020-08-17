'use strict'

module.exports = (sequelize, DataTypes) => {
  const AutomationQueue = sequelize.define('automation_queue', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    email: {
        type: DataTypes.STRING
    },
    transfer_from: {
        type: DataTypes.STRING
    },
    transfer_to: {
        type: DataTypes.STRING
    },
    amount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    status: {
        type: DataTypes.STRING
    },
    main_balance: {
        type: DataTypes.STRING
    },
  }, {
    timestamps: false
  });
  return AutomationQueue;
};


