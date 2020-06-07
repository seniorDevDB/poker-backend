// const express = require("express")
// const app = express.Router()
const cors = require('cors')
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt')

const User = require("../models/User")


process.env.SECRET_KEY = 'secret'

description = {

}

module.exports = (app, db) => {
    app.use(cors())
    app.post('/register', (req, res) => {
        console.log("okokok")
        var today = new Date()
        const userData = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            password: req.body.password,
            created: today,
            main_balance: 0,
            points: 0,
            rake_back: 0,
        }
        db.users.findOne({
            where: {
                email: req.body.email
            }
        })
        .then(user => {
            if(!user) {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    userData.password = hash
                    db.users.create(userData)
                    .then(user => {
                        res.json({status: user.email + ' registered'})
                    })
                    .catch(err => {
                        res.send('error: ' + err)
                    })
                })
            } else {
                res.json({error: "User already exists"})
            }
        })
        .catch(err => {
            res.send('error: ' + err)
        })
    })

    app.post('/login', (req, res) => {
        console.log("login called from frontend")
        db.users.findOne({
            where: {
                email: req.body.email
            }
        })
        .then(user => {
            console.log("this is login then")
            if(user) {
                console.log("ddeeeeeeeeeeeeeeeee", user.password)
                if(bcrypt.compareSync(req.body.password, user.password)) {
                    console.log("dfdsfasfdsdf")
                    let token = jwt.sign(user.dataValues, process.env.SECRET_KEY, {
                        expiresIn: 1440
                    })
                    console.log(token)
                    res.send(token)
                }
                else {
                    console.log("incorrect password")
                    res.status(400).json({ error: 'Password is not correct' })
                }
            } else {
                console.log("does not exist")
                res.status(400).json({ error: 'User does not exist' })
            }
        })
        .catch(err => {
            console.log("eeeerrrr")
            res.status(400).json({ error: err })
        })
    })

    app.post('/transaction_history', (req, res) => {
        console.log("history called from frontend", req.body.id)
        db.transaction_history.findAll({
            order: [
                ['id', 'DESC'],
            ],
            where: {
                user_id: req.body.id
            }
        })
        .then(histories => {
            console.log("database from db", histories)
            res.send(histories)
        })
        .catch(err => {
            console.log("eeeerrrr")
            res.status(400).json({ error: err })
        })
    })

    app.post('/player', (req, res) => {
        console.log("player called from frontend", req.body.receiver);
        var today = new Date()
        const p2pData = {
            date: today,
            sender: req.body.sender,
            receiver: req.body.receiver,
            amount: req.body.amount,
            status: "Complete"
        }

        db.users.findOne({
            where: {
                email: req.body.sender
            }
        })
        .then(sender_data => {
            update_balance = Number(sender_data.main_balance) - Number(req.body.amount)
            console.log(update_balance)
            sender_data.update({
                main_balance: update_balance 
            })
            const transaction_history_sender_data = {
                date: today,
                amount: req.body.amount,
                description: "P2P to " +  req.body.receiver,
                status: "Complete",
                main_balance: update_balance,
                user_id: sender_data.id,
            }
            db.transaction_history.create(transaction_history_sender_data)
        })
        .catch(err => {
            console.log("errororvbvbvb 147", err)
            res.json({ error: "Sender error" })
        })

        db.users.findOne({
            where: {
                email: req.body.receiver
            }
        })
        .then(receiver_data => {
            update_balance = Number(receiver_data.main_balance) + Number(req.body.amount)
            receiver_data.update({
                main_balance: update_balance
            })
            const transaction_history_receiver_data = {
                date: today,
                amount: req.body.amount,
                description: "P2P from " +  req.body.sender,
                status: "Complete",
                main_balance: update_balance,
                user_id: receiver_data.id,
            }
            db.transaction_history.create(transaction_history_receiver_data)
            db.p2p_transfer.create(p2pData)
            .then( data => {
                res.json({status: 'Transfered'})
            })
            .catch(err => {
                console.log("errororvbvbvb 168", err)
                res.json({ error: "This player does not exist" })
            })
        })
        .catch(err => {
            console.log("erroror 107")
            console.log(err);
            res.json({ error: "This player does not exist" })
        })

    })

    app.post('/cashout', (req, res) => {
        var today = new Date()
        console.log("cashout called from frontend")
        db.users.findOne({
            where: {
                email: req.body.email
            }
        })
        .then(user => {
            const cashout_date ={
                date: today,
                email: req.body.email,
                amount: req.body.amount,
                cash_tag: '',
                status: 'Pending'
            }
            db.cashout.create(cashout_date)
            update_main_balance = Number(user.main_balance) - Number(req.body.amount)
            user.update({
                main_balance: update_main_balance
            })

            const transaction_history_cashout_data = {
                date: today,
                amount: req.body.amount,
                description: "Cashout - Pending",
                status: "Pending",
                main_balance: user.main_balance,
                user_id: user.id
            }
            db.transaction_history.create(transaction_history_cashout_data)
            .then( data => {
                res.json({status: 'Transfered'})
            })
        })
        .catch(err => {
            console.log("eeeerrrr")
            res.json({ error: err })
        })
    })

    app.post('/cancel_cashout', (req, res) => {
        console.log("dddddddddddddddddddddcancel", req.body)
        db.cashout.findOne({
            where: {
                email: req.body.email,
                date: req.body.date
            }
        })
        .then(user => {
            console.log("ddddddddddddddddd", user)
            user.update({
                status: "Cancelled"
            })

            db.transaction_history.findOne({
                where: {
                    user_id: req.body.id,
                    date: req.body.date
                }
            })
            .then(transaction_history_data => {
                console.log("242242242", transaction_history_data)
                transaction_history_data.update({
                    status: "Cancelled"
                })
                res.json({ status: "Cancelled" })
            })
            .catch(err => {
                console.log("eeeerrrr")
                res.json({ error: err })
            })
        })
        .catch(err => {
            console.log("eeeerrrr")
            res.json({ error: err })
        })
    })
}