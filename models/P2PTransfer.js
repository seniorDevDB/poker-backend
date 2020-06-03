'use strict'

module.exports = (sequelize, DataTypes) => {
  const P2PTransfer = sequelize.define('p2p_transfer', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    sender: {
        type: DataTypes.STRING
    },
    receiver: {
        type: DataTypes.STRING
    },
    amount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    status: {
        type: DataTypes.STRING
    },
  }, {
    timestamps: false
  });
  return P2PTransfer;
};
