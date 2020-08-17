"use strict";
const cors = require("cors");
const { transaction_history } = require("../database/db");

module.exports = (app, db) => {
  app.use(cors());
  app.post("/update_poker_automation_queue", (req, res) => {
    console.log("automation queue called from automation backend", req.body)

    db.transfer
      .findOne({
        where: {
          transfer_from: req.body.transfer_from,
          transfer_to: req.body.transfer_to,
          amount: req.body.amount
        }
      })
      .then((result) => {
        console.log("here is the result", result)
        result.update({
          status: req.body.result
        })
        .then(() => {
            // update the database
             db.transaction_history
                .findOne({
                    where: {
                        date: result.date,
                        amount: req.body.amount,
                        status: "Pending",
                        type: "transfer"
                    }
                })
                .then((transaction_history_result) => {
                    if (req.body.result == "Complete") {
                        updated_main_balance = Number(transaction_history_result.main_balance) + Number(req.body.amount)
                        transaction_history_result.update({
                            status: req.body.result,
                            main_balance: updated_main_balance,
                        })
                        .then(() => {
                            //update user main balance
                            db.users
                                .findOne({
                                    where: {
                                        id: transaction_history_result.user_id
                                    }
                                })
                                .then((user_result) => {
                                    user_result.update({
                                        main_balance: updated_main_balance
                                    })
                                    res.json({ status: "success" });
                                })
                        })
                    }
                    else if (req.body.result == "Fail") {
                        transaction_history_result.update({
                            status: req.body.result
                        })
                        res.json({ status: "success" });
                    }

                })
        })
      })
      .catch((err) => {
        console.log("eeeerrrr");
        res.status(400).json({ error: err });
      });
  });

}