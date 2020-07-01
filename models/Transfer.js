"use strict";

module.exports = (sequelize, DataTypes) => {
  const Transfer = sequelize.define(
    "transfer",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      email: {
        type: DataTypes.STRING,
      },
      amount: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      transfer_from: {
        type: DataTypes.STRING,
      },
      transfer_to: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.STRING,
      },
    },
    {
      timestamps: false,
    }
  );
  return Transfer;
};
