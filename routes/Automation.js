"use strict";
const cors = require("cors");
const { transaction_history, transfer } = require("../database/db");

module.exports = (app, db) => {
  app.use(cors());
  app.post("/update_poker_automation_queue", (req, res) => {
    console.log("automation queue called from automation backend", req.body)

    db.transfer
      .findAll({
        where: {
          transfer_from: req.body.transfer_from,
          transfer_to: req.body.transfer_to,
          amount: req.body.amount
        }
      })
      .then((result) => {
        console.log("here is the result", result)
        var transfer_length = result.length
        result[transfer_length-1].update({
          status: req.body.result
        })
        .then(() => {
            console.log(result[transfer_length-1].date)
            
            // update the database
             db.transaction_history
                .findAll({
                    where: {
                        date: result[transfer_length-1].date,
                        amount: req.body.amount,
                        status: "Pending",
                        type: "transfer"
                    }
                })
                .then((transaction_history_result) => {
                    var transaction_history_length = transaction_history_result.length
                    if (req.body.result == "Complete") {
                        console.log("nnnnnn______________________", transaction_history_result[transaction_history_length-1])

                        var updated_main_balance;
                        if (req.body.transfer_from == "Main Balance"){
                          updated_main_balance = Number(transaction_history_result[transaction_history_length-1].main_balance)
                        }
                        else if(req.body.transfer_to == "Main Balance"){
                          updated_main_balance = Number(transaction_history_result[transaction_history_length-1].main_balance) + Number(req.body.amount)
                        }
                        
                        console.log("dddd", updated_main_balance)
                        transaction_history_result[transaction_history_length-1].update({
                            status: req.body.result,
                            main_balance: updated_main_balance,
                        })
                        .then(() => {
                            //update user main balance
                            db.users
                                .findOne({
                                    where: {
                                        id: transaction_history_result[transaction_history_length-1].user_id
                                    }
                                })
                                .then((user_result) => {
                                    user_result.update({
                                        main_balance: updated_main_balance
                                    })
                                    console.log("emaildfddfdfdfdfdfdfddfdf", result[transfer_length-1].email)
                                    const socketInd = global.sockets.findIndex(
                                      (iSocket) => iSocket.email == result[transfer_length-1].email
                                    );
                                    if (socketInd != -1)
                                    {
                                      global.sockets[socketInd].emit('refresh_success_poker');
                                    }

                                    res.json({ status: "success" });
                                })
                        })

                        // const socketInd = global.sockets.findIndex(
                        //   (iSocket) => iSocket.email == user_result.email
                        // );

                        // const socketInd = global.sockets.findIndex(
                        //   (iSocket) => iSocket.email == 'test_user@gmail.com'
                        // );
                        // if (socketInd != -1)
                        // {
                        //   global.sockets[socketInd].emit('refresh');
                        // }

                    }
                    else if (req.body.result == "Fail") {
                      console.log("here is fail failffffffffffffffffffffffff")
                        transaction_history_result[transaction_history_length-1].update({
                            status: req.body.result
                        })
                        .then(() =>{
                          const socketInd = global.sockets.findIndex(
                            (iSocket) => iSocket.email == result[transfer_length-1].email
                          );
                          if (socketInd != -1)
                          {
                            global.sockets[socketInd].emit('refresh_fail_poker');
                          }
                          res.json({ status: "success" });
                        })
                        
                    }

                })
        })
      })
      .catch((err) => {
        console.log("eeeerrrr");
        res.status(400).json({ error: err });
      });
  });

  app.post("/update_cash_automation_queue", (req, res) => {
    console.log("update cash automation is called", req.body)
    console.log(req.body.date)
    //update status
    db.deposit
      .findOne({
        where: {
          date: req.body.date,
          amount: req.body.amount,
          cash_tag: req.body.cash_tag,
        }
      })
      .then((deposit_result) => {
        deposit_result.update({
          status: req.body.result
        })
        .then(() => {
          //update transaction history and main balance
          db.transaction_history
            .findOne({
              where: {
                date: req.body.date,
                amount: req.body.amount,
                type: "cash-deposit",
                status: "Pending",
              }
            })
            .then((transaction_history_result) =>{
              console.log("ggg", transaction_history_result)
              if (req.body.result == "Complete"){
                transaction_history_result.update({
                  status: "Complete",
                  main_balance: Number(transaction_history_result.main_balance) + Number(req.body.amount)
                })
                .then(()=>{
                  db.users
                    .findOne({
                      where: {
                        id: transaction_history_result.user_id
                      }
                    })
                    .then((user_result) => {
                      user_result.update({
                        main_balance: Number(user_result.main_balance) + Number(req.body.amount)
                      })
                    })
                    .then(() => {
                      const socketInd = global.sockets.findIndex(
                        (iSocket) => iSocket.email == deposit_result.email
                      );
                      if (socketInd != -1)
                      {
                        global.sockets[socketInd].emit('refresh_success_cash');
                      }

                      res.json({ status: "success" });
                    })
                })
              }
              else if (req.body.result == "Fail"){
                transaction_history_result.update({
                  status: "Fail",
                })
                .then(() => {
                  const socketInd = global.sockets.findIndex(
                    (iSocket) => iSocket.email == deposit_result.email
                  );
                  if (socketInd != -1)
                  {
                    global.sockets[socketInd].emit('refresh_fail_cash');
                  }

                  res.json({ status: "success" });
                })
              }
            })
        })
      })
  });

}