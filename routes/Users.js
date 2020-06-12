// const express = require("express")
// const app = express.Router()
const cors = require('cors')
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt')

const User = require("../models/User")
const CashAppAutomation = require("../automation/cash_app")


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
            main_balance: 100,
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
                    res.json({ error: 'Password is not correct' })
                }
            } else {
                console.log("does not exist")
                res.json({ error: 'User does not exist' })
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
        console.log("dddddddddddddddddddddcancel", req.body.amount)
        var today = new Date()
        db.cashout.findOne({
            where: {
                email: req.body.email,
                date: req.body.date
            }
        })
        .then(user => {
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
                console.log("242242242")
                console.log(req.body.amount)
                console.log(Number(req.body.amount))
                console.log( Number(transaction_history_data.main_balance) - Number(req.body.amount))
                transaction_history_data.update({
                    status: "Cancelled",
                })
                const temp_data = {
                    date: today,
                    amount: Math.abs(Number(req.body.amount)),
                    description: "Cashout - Refund",
                    status: "Complete",
                    main_balance: Number(transaction_history_data.main_balance) - Number(req.body.amount),
                    user_id: req.body.id
                }
                db.transaction_history.create(temp_data)
                .then( data => {
                    db.users.findOne({
                        where: {
                            email: req.body.email
                        }
                    })
                    .then(user_data => {
                        user_data.update({
                            main_balance: Number(transaction_history_data.main_balance) - Number(req.body.amount)
                        })
                    })
                    res.json({ status: "Cancelled" })
                })
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

    // app.post('/test', (req, res) => {
    //     console.log("deposit called from frontend");
    //     CashAppAutomation();
    // })

    app.post('/deposit_continue', (req, res) => {
        console.log("deposit called from frontend", req.body)
        var today = new Date()
        db.users.findOne({
            where: {
                email: req.body.email
            }
        })
        .then(user => {
            console.log("okok", user)
            const deposit_data = {
                date: today,
                amount: Number(req.body.amount),
                description: "Deposit - Pending",
                status: "Pending",
                main_balance: user.main_balance,
                user_id: user.id,
            }
            console.log("311311311")
            db.transaction_history.create(deposit_data)
            .then(result => {
                console.log("database from db")
                //save in the deposit table
                const deposit_table_data = {
                    date: today,
                    email: req.body.email,
                    amount: Number(req.body.amount),
                    cash_tag: req.body.cash_tag,
                    status: "Pending"
                }
                db.deposit.create(deposit_table_data)
                .then(result => {
                    res.json({ time: today })
                })
            })
            .catch(err => {
                console.log("eeeerrrr")
                res.status(400).json({ error: err })
            })

        })
        .catch(err => {
            console.log("eeeerrrrdddd")
            res.status(400).json({ error: err })
        })
        
    })

    app.post('/deposit_validate', (req, res) => {
        console.log("deposit validate called from frontend", req.body)
        var today = new Date()
        db.users.findOne({
            where: {
                email: req.body.email
            }
        })
        .then(user => {
            console.log("I got the user", req.body.date)
            db.transaction_history.findOne({
                where: {
                    user_id: user.id,
                    date: req.body.date
                }
            })
            .then(transaction_history_data => {
                console.log("get transaction historydddddd")
                const new_data_complete = {
                    date: today,
                    amount: Number(transaction_history_data.amount),
                    description: "Deposit - Complete",
                    status: "Complete",
                    main_balance: Number(transaction_history_data.main_balance) + Number(transaction_history_data.amount),
                    user_id: transaction_history_data.user_id,
                }
                const new_data_fail = {
                    date: today,
                    amount: Number(transaction_history_data.amount),
                    description: "Deposit - Fail",
                    status: "Fail",
                    main_balance: Number(transaction_history_data.main_balance),
                    user_id: transaction_history_data.user_id,
                }
                
                if (req.body.b_status){
                    transaction_history_data.update({
                        description: "Deposit - Complete",
                        status: "Complete" 
                    })
                    .then(result => {
                        console.log("created successed in database")
                        db.deposit.findOne({
                            where: {
                                email: req.body.email,
                                date: req.body.date,
                            }
                        })
                        .then(deposit_result => {
                            deposit_result.update({
                                status: "Complete"
                            })
                            res.json({ status: "created" })
                        })
                    })
                    .catch(err => {
                        console.log("eeeerrrr")
                        res.status(400).json({ error: err })
                    })
                }

                else {
                    transaction_history_data.update({
                        description: "Deposit - Fail",
                        status: "Fail" 
                    })
                    .then(result => {
                        console.log("created successed fail data in database")
                        db.deposit.findOne({
                            where: {
                                email: req.body.email,
                                date: req.body.date,
                            }
                        })
                        .then(deposit_result => {
                            deposit_result.update({
                                status: "Fail"
                            })
                            res.json({ status: "created" })
                        })
                    })
                    .catch(err => {
                        console.log("eeeerrrr")
                        res.status(400).json({ error: err })
                    })
                }
    
            })
            .catch(err => {
                console.log("eeeerrrrdddd")
                res.status(400).json({ error: err })
            })
        })
        .catch(err => {
            console.log("eeeerrsssssssssrrdddd")
            res.status(400).json({ error: err })
        })
        
        
    })
}