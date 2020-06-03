'use strict'
const cors = require('cors')

module.exports = (app, db) => {
    app.use(cors())
    app.post('/users', (req, res) => {
        console.log("users called from frontend")
        db.users.findAll({
        })
        .then(users => {
            console.log("database from db", users)
            res.send(users)
        })
        .catch(err => {
            console.log("eeeerrrr")
            res.status(400).json({ error: err })
        })
    })

    app.post('/p2p_transfer', (req, res) => {
        console.log("users called from frontend")
        db.p2p_transfer.findAll({
        })
        .then(data => {
            console.log("database from db", data)
            res.send(data)
        })
        .catch(err => {
            console.log("eeeerrrr")
            res.status(400).json({ error: err })
        })
    })

    app.post('/cashout_pending', (req, res) => {
        console.log("users called from frontend")
        db.p2p_transfer.findAll({
        })
        .then(data => {
            console.log("database from db", data)
            res.send(data)
        })
        .catch(err => {
            console.log("eeeerrrr")
            res.status(400).json({ error: err })
        })
    })
}