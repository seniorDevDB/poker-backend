'use strict';

module.exports = (sequelize, DataTypes) => {
    const Users = sequelize.define('users', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        first_name: {
            type: DataTypes.STRING
        },
        last_name: {
            type: DataTypes.STRING
        },
        email: {
            type: DataTypes.STRING
        },
        password: {
            type: DataTypes.STRING
        },
        created: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        main_balance: {
            type: DataTypes.STRING
        },
        points: {
            type: DataTypes.STRING
        },
        rake_back: {
            type: DataTypes.STRING
        },
        super_user: {
            type: DataTypes.BOOLEAN,
            defaultValue: DataTypes.FALSE
        },
        login_status: {
            type: DataTypes.BOOLEAN,
            defaultValue: DataTypes.FALSE
        },
        popup_message_read_status: {
            type: DataTypes.BOOLEAN,
            defaultValue: DataTypes.FALSE
        },
        pending_status: {
            type: DataTypes.BOOLEAN,
            defaultValue: DataTypes.FALSE
        }
    }, {
        timestamps: false
    });
    return Users;
  };