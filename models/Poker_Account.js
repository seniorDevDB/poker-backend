'use strict'

module.exports = (sequelize, DataTypes) => {
  const Poker_Account = sequelize.define('poker_account', {
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
    club_name: {
        type: DataTypes.STRING,
    },
    username: {
        type: DataTypes.STRING
    },
    user_id: {
        type: DataTypes.STRING
    },
  }, {
    timestamps: false
  });
  return Poker_Account;
};


