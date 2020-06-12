'use strict'

module.exports = (sequelize, DataTypes) => {
  const Deposit = sequelize.define('deposit', {
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
    amount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    cash_tag: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.STRING
    },
  }, {
    timestamps: false
  });
  return Deposit;
};


