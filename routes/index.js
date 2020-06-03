'use strict'

const routes = [
    require('./Users'),
    require('./Admin')
];

// Add access to the app and db objects to each route
module.exports = function router(app, db) {
    console.log('xxxxxxxxxxxxxxxxxxxx');
    return routes.forEach((route) => {
      route(app, db);
    });
};