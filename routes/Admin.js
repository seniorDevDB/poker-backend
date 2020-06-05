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
        db.cashout.findAll({
            where: {
                Status: "Pending"
            }
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

    app.post('/cashout_complete', (req, res) => {
        console.log("users cashout complete called from frontend")
        db.cashout.findAll({
            where: {
                Status: "Complete"
            }
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

    app.post('/accept_cashout', (req, res) => {
        console.log("users called from frontend")
        console.log(req.body.date)
        db.cashout.findOne({
            where: {
                date: req.body.date,
                email: req.body.email
            }
        })
        .then(cashout_data => {
            cashout_data.update({
                status: "Complete"
            })
            console.log("dddoneone")
            // res.json({status: 'complete'})
        })
        .catch(err => {
            console.log("eeeerrrr")
            res.status(400).json({ error: err })
        })

        db.users.findOne({
            where: {
                email: req.body.email
            }
        })
        .then(user => {
            console.log("787878787878", user.id)
            db.transaction_history.findOne({
                where: {
                    date: req.body.date,
                    user_id: user.id
                }
            })
            .then(transaction_history_data => {
                console.log("878787878787", transaction_history_data)
                transaction_history_data.update({
                    description: "Cashout - Complete",
                    status: "Complete"
                })
                res.json({status: 'complete'})
            })
            .catch(err => {
                console.log("eeeerrrr")
                res.status(400).json({ error: err })
            })
        })
    })

    app.post('/decline_cashout', (req, res) => {
        console.log("users called from frontend")
        db.cashout.findOne({
            where: {
                date: req.body.date,
                email: req.body.email
            }
        })
        .then(cashout_data => {
            cashout_data.update({
                status: "Declined"
            })
            console.log("dddoneone")
            // res.json({status: 'complete'})
        })
        .catch(err => {
            console.log("eeeerrrr")
            res.status(400).json({ error: err })
        })

        db.users.findOne({
            where: {
                email: req.body.email
            }
        })
        .then(user => {
            console.log("787878787878", user.id)
            db.transaction_history.findOne({
                where: {
                    date: req.body.date,
                    user_id: user.id
                }
            })
            .then(transaction_history_data => {
                console.log("878787878787", transaction_history_data)
                transaction_history_data.update({
                    description: "Cashout - Declined",
                    status: "Declined"
                })
                res.json({status: 'declined'})
            })
            .catch(err => {
                console.log("eeeerrrr")
                res.status(400).json({ error: err })
            })
        })
    })

    
}