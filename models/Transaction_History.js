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
    type: {
      type: DataTypes.STRING
    }
  }, {
    timestamps: false
  });
  return TransactionHistory;
};


