// const express = require("express")
// const app = express.Router()
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const User = require("../models/User");
// const CashAppAutomation = require("../automation/cash_app")

process.env.SECRET_KEY = "secret";

description = {};

module.exports = (app, db) => {
  app.use(cors());
  app.post("/register", (req, res) => {
    console.log("okokok");
    var today = new Date();
    const userData = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      password: req.body.password,
      created: today,
      main_balance: 100,
      points: 0,
      rake_back: 0,
    };
    db.users
      .findOne({
        where: {
          email: req.body.email,
        },
      })
      .then((user) => {
        if (!user) {
          bcrypt.hash(req.body.password, 10, (err, hash) => {
            userData.password = hash;
            db.users
              .create(userData)
              .then((user) => {
                res.json({ status: user.email + " registered" });
              })
              .catch((err) => {
                res.send("error: " + err);
              });
          });
        } else {
          res.json({ error: "User already exists" });
        }
      })
      .catch((err) => {
        res.send("error: " + err);
      });
  });

  app.post("/login", (req, res) => {
    console.log("login called from frontend");
    db.users
      .findOne({
        where: {
          email: req.body.email,
        },
      })
      .then((user) => {
        console.log("this is login then");
        if (user) {
          console.log("ddeeeeeeeeeeeeeeeee", user.password);
          if (bcrypt.compareSync(req.body.password, user.password)) {
            console.log("dfdsfasfdsdf");
            let token = jwt.sign(user.dataValues, process.env.SECRET_KEY, {
              expiresIn: 1440,
            });
            console.log(token);
            res.send(token);
          } else {
            console.log("incorrect password");
            res.json({ error: "Password is not correct" });
          }
        } else {
          console.log("does not exist");
          res.json({ error: "User does not exist" });
        }
      })
      .catch((err) => {
        console.log("eeeerrrr");
        res.status(400).json({ error: err });
      });
  });

  app.post("/transaction_history", (req, res) => {
    console.log("history called from frontend", req.body.id);
    db.transaction_history
      .findAll({
        order: [["id", "DESC"]],
        where: {
          user_id: req.body.id,
        },
      })
      .then((histories) => {
        res.send(histories);
      })
      .catch((err) => {
        console.log("eeeerrrr");
        res.status(400).json({ error: err });
      });
  });

  app.post("/player", (req, res) => {
    console.log("player called from frontend", req.body.receiver);
    var today = new Date();
    const p2pData = {
      date: today,
      sender: req.body.sender,
      receiver: req.body.receiver,
      amount: req.body.amount,
      status: "Complete",
    };

    db.users
      .findOne({
        where: {
          email: req.body.sender,
        },
      })
      .then((sender_data) => {
        update_balance =
          Number(sender_data.main_balance) - Number(req.body.amount);
        console.log(update_balance);
        sender_data.update({
          main_balance: update_balance,
        });
        const transaction_history_sender_data = {
          date: today,
          amount: req.body.amount,
          description: "P2P to " + req.body.receiver,
          status: "Complete",
          main_balance: update_balance,
          user_id: sender_data.id,
        };
        db.transaction_history.create(transaction_history_sender_data);
      })
      .catch((err) => {
        console.log("errororvbvbvb 147", err);
        res.json({ error: "Sender error" });
      });

    db.users
      .findOne({
        where: {
          email: req.body.receiver,
        },
      })
      .then((receiver_data) => {
        update_balance =
          Number(receiver_data.main_balance) + Number(req.body.amount);
        receiver_data.update({
          main_balance: update_balance,
        });
        const transaction_history_receiver_data = {
          date: today,
          amount: req.body.amount,
          description: "P2P from " + req.body.sender,
          status: "Complete",
          main_balance: update_balance,
          user_id: receiver_data.id,
        };
        db.transaction_history.create(transaction_history_receiver_data);
        db.p2p_transfer
          .create(p2pData)
          .then((data) => {
            res.json({ status: "Transfered" });
          })
          .catch((err) => {
            console.log("errororvbvbvb 168", err);
            res.json({ error: "This player does not exist" });
          });
      })
      .catch((err) => {
        console.log("erroror 107");
        console.log(err);
        res.json({ error: "This player does not exist" });
      });
  });

  app.post("/cashout", (req, res) => {
    var today = new Date();
    console.log("cashout called from frontend");
    db.users
      .findOne({
        where: {
          email: req.body.email,
        },
      })
      .then((user) => {
        if (Number(req.body.amount) > Number(user.main_balance)) {
          res.json({ big_amount: "Too big amount" });
        }
        //check if it is only pending cashout
        db.cashout
          .findAll({
            where: {
              email: req.body.email,
              status: "Pending",
            },
          })
          .then((cashout_pending_result) => {
            if (cashout_pending_result.length >= 1) {
              res.json({
                one_pending_status:
                  "You can only have one pending cashout request at a time",
              });
            } else {
              const cashout_date = {
                date: today,
                email: req.body.email,
                amount: req.body.amount,
                cash_tag: "",
                status: "Pending",
              };
              db.cashout.create(cashout_date);

              update_main_balance =
                Number(user.main_balance) - Number(req.body.amount);
              user.update({
                main_balance: update_main_balance,
              });

              const transaction_history_cashout_data = {
                date: today,
                amount: req.body.amount,
                description: "Cashout - Pending",
                status: "Pending",
                main_balance: user.main_balance,
                user_id: user.id,
              };
              db.transaction_history
                .create(transaction_history_cashout_data)
                .then((data) => {
                  res.json({ status: "Transfered" });
                });
            }
          });
      })
      .catch((err) => {
        console.log("eeeerrrr");
        res.json({ error: err });
      });
  });

  app.post("/cancel_cashout", (req, res) => {
    console.log("dddddddddddddddddddddcancel", req.body.amount);
    var today = new Date();
    db.cashout
      .findOne({
        where: {
          email: req.body.email,
          date: req.body.date,
        },
      })
      .then((user) => {
        user.update({
          status: "Cancelled",
        });

        db.transaction_history
          .findOne({
            where: {
              user_id: req.body.id,
              date: req.body.date,
            },
          })
          .then((transaction_history_data) => {
            console.log("242242242");
            console.log(req.body.amount);
            console.log(Number(req.body.amount));
            console.log(
              Number(transaction_history_data.main_balance) -
                Number(req.body.amount)
            );
            transaction_history_data.update({
              status: "Cancelled",
            });
            const temp_data = {
              date: today,
              amount: Math.abs(Number(req.body.amount)),
              description: "Cashout - Refund",
              status: "Complete",
              main_balance:
                Number(transaction_history_data.main_balance) -
                Number(req.body.amount),
              user_id: req.body.id,
            };
            db.transaction_history.create(temp_data).then((data) => {
              db.users
                .findOne({
                  where: {
                    email: req.body.email,
                  },
                })
                .then((user_data) => {
                  user_data.update({
                    main_balance:
                      Number(transaction_history_data.main_balance) -
                      Number(req.body.amount),
                  });
                });
              res.json({ status: "Cancelled" });
            });
          })
          .catch((err) => {
            console.log("eeeerrrr");
            res.json({ error: err });
          });
      })
      .catch((err) => {
        console.log("eeeerrrr");
        res.json({ error: err });
      });
  });

  // app.post('/test', (req, res) => {
  //     console.log("deposit called from frontend");
  //     CashAppAutomation();
  // })

  app.post("/deposit_continue", (req, res) => {
    console.log("deposit called from frontend", req.body);
    var today = new Date();
    db.users
      .findOne({
        where: {
          email: req.body.email,
        },
      })
      .then((user) => {
        console.log("okok", user);
        const deposit_data = {
          date: today,
          amount: Number(req.body.amount),
          description: "Deposit - Pending",
          status: "Pending",
          main_balance: user.main_balance,
          user_id: user.id,
        };
        console.log("311311311");
        db.transaction_history
          .create(deposit_data)
          .then((result) => {
            console.log("database from db");
            //save in the deposit table
            const deposit_table_data = {
              date: today,
              email: req.body.email,
              amount: Number(req.body.amount),
              cash_tag: req.body.cash_tag,
              status: "Pending",
            };
            db.deposit.create(deposit_table_data).then((result) => {
              res.json({ time: today });
            });
          })
          .catch((err) => {
            console.log("eeeerrrr");
            res.status(400).json({ error: err });
          });
      })
      .catch((err) => {
        console.log("eeeerrrrdddd");
        res.status(400).json({ error: err });
      });
  });

  app.post("/deposit_validate", (req, res) => {
    console.log("deposit validate called from frontend", req.body);
    var today = new Date();
    console.log("today todaytdddddddddddddd", today);
    db.users
      .findOne({
        where: {
          email: req.body.email,
        },
      })
      .then((user) => {
        console.log("I got the user", req.body.date);
        db.transaction_history
          .findOne({
            where: {
              user_id: user.id,
              date: req.body.date,
            },
          })
          .then((transaction_history_data) => {
            console.log("get transaction historydddddd");
            const new_data_complete = {
              date: today,
              amount: Number(transaction_history_data.amount),
              description: "Deposit - Complete",
              status: "Complete",
              main_balance:
                Number(transaction_history_data.main_balance) +
                Number(transaction_history_data.amount),
              user_id: transaction_history_data.user_id,
            };
            const new_data_fail = {
              date: today,
              amount: Number(transaction_history_data.amount),
              description: "Deposit - Fail",
              status: "Fail",
              main_balance: Number(transaction_history_data.main_balance),
              user_id: transaction_history_data.user_id,
            };

            if (req.body.b_status) {
              transaction_history_data
                .update({
                  description: "Deposit - Complete",
                  status: "Complete",
                  main_balance:
                    Number(transaction_history_data.main_balance) +
                    Number(transaction_history_data.amount),
                })
                .then((result) => {
                  console.log("created successed in database");
                  db.users
                    .findOne({
                      where: {
                        email: req.body.email,
                      },
                    })
                    .then((user_result) => {
                      user_result.update({
                        main_balance:
                          Number(transaction_history_data.main_balance) +
                          Number(transaction_history_data.amount),
                      });
                    });

                  db.deposit
                    .findOne({
                      where: {
                        email: req.body.email,
                        date: req.body.date,
                      },
                    })
                    .then((deposit_result) => {
                      deposit_result.update({
                        status: "Complete",
                        date: today,
                      });
                      res.json({ status: "created" });
                    });
                })
                .catch((err) => {
                  console.log("eeeerrrr");
                  res.status(400).json({ error: err });
                });
            } else {
              transaction_history_data
                .update({
                  description: "Deposit - Fail",
                  status: "Fail",
                })
                .then((result) => {
                  console.log("created successed fail data in database");
                  db.deposit
                    .findOne({
                      where: {
                        email: req.body.email,
                        date: req.body.date,
                      },
                    })
                    .then((deposit_result) => {
                      deposit_result.update({
                        status: "Fail",
                        date: today,
                      });
                      res.json({ status: "created" });
                    });
                })
                .catch((err) => {
                  console.log("eeeerrrr");
                  res.status(400).json({ error: err });
                });
            }
          })
          .catch((err) => {
            console.log("eeeerrrrdddd");
            res.status(400).json({ error: err });
          });
      })
      .catch((err) => {
        console.log("eeeerrsssssssssrrdddd");
        res.status(400).json({ error: err });
      });
  });

  app.post("/add_poker_account", (req, res) => {
    var today = new Date();
    const pokerAccountData = {
      date: today,
      email: req.body.email,
      club_name: req.body.club_name,
      username: req.body.username,
      user_id: req.body.user_id,
    };
    db.poker_account
      .findOne({
        where: {
          email: req.body.email,
          club_name: req.body.club_name,
          username: req.body.username,
          user_id: req.body.user_id,
        },
      })
      .then((poker_account) => {
        if (!poker_account) {
          console.log("create a new poker account");
          db.poker_account
            .create(pokerAccountData)
            .then((acount) => {
              db.poker_account
                .findAll({
                  order: [["id", "DESC"]],
                  where: {
                    email: req.body.email,
                  },
                })
                .then((accounts) => {
                  res.send(accounts);
                })
                .catch((err) => {
                  console.log("eeeerrrr");
                  res.status(400).json({ error: err });
                });
            })
            .catch((err) => {
              res.send("error: " + err);
            });
        } else {
          res.json({ error: "User already exists" });
        }
      })
      .catch((err) => {
        res.send("error: " + err);
      });
  });

  app.post("/get_poker_account", (req, res) => {
    console.log("poker called called called", req.body.email);
    db.poker_account
      .findAll({
        order: [["id", "DESC"]],
        where: {
          email: req.body.email,
        },
      })
      .then((accounts) => {
        console.log("518518", accounts);
        res.send(accounts);
      })
      .catch((err) => {
        console.log("eeeerrrr");
        res.json({ error: err });
      });
  });

  app.post("/poker_automation_pending", (req, res) => {
    console.log("called from frontend poker automation", req.body);
    var today = new Date();
    const pokerAutomationTransferData = {
      date: today,
      email: req.body.email,
      amount: req.body.amount,
      transfer_from: req.body.transfer_from,
      transfer_to: req.body.transfer_to,
      status: "Pending",
    };
    db.transfer.create(pokerAutomationTransferData);
    // .then(accounts => {
    //     console.log("518518")
    //     res.send({ status: "Success" })
    // })
    // .catch(err => {
    //     console.log("eeeerrrr")
    //     res.json({ error: err })
    // })

    db.users
      .findOne({
        where: {
          email: req.body.email,
        },
      })
      .then((user) => {
        console.log("I got the user");
        if (Number(req.body.amount > Number(user.main_balance))) {
          res.json({ status: "Too big amount" });
        } else if (req.body.transfer_to == "Main Balance") {
          const pokerAutomationTransactionHistoryData_from = {
            date: today,
            amount: Number(req.body.amount),
            description: "Transfer from " + req.body.transfer_from,
            status: "Pending",
            // main_balance: Number(user.main_balance) + Number(req.body.amount),
            main_balance: Number(user.main_balance),
            user_id: user.id,
          };
          db.transaction_history
            .create(pokerAutomationTransactionHistoryData_from)
            .then((info) => {
              console.log("566666666");
              res.json({ date: today });
            })
            .catch((err) => {
              console.log("eeeerrrr");
              res.status(400).json({ error: err });
            });
        } else if (req.body.transfer_from == "Main Balance") {
          const pokerAutomationTransactionHistoryData_to = {
            date: today,
            amount: Number(req.body.amount),
            description: "Transfer to " + req.body.transfer_to,
            status: "Pending",
            main_balance: Number(user.main_balance) - Number(req.body.amount),
            // main_balance: Number(user.main_balance),
            user_id: user.id,
          };
          db.transaction_history
            .create(pokerAutomationTransactionHistoryData_to)
            .then((info) => {
              console.log("566666666");
              res.json({ date: today });
            })
            .catch((err) => {
              console.log("eeeerrrr");
              res.json({ error: err });
            });
        }
      });
  });

  app.post("/poker_automation_complete", (req, res) => {
    console.log("poker called called called complete", req.body.date);
    db.users
      .findOne({
        where: {
          email: req.body.email,
        },
      })
      .then((user) => {
        if (req.body.transfer_to == "Main Balance") {
          console.log(
            "6075607",
            Number(user.main_balance) + Number(req.body.amount)
          );
          user.update({
            main_balance: Number(user.main_balance) + Number(req.body.amount),
          });
        } else if (req.body.transfer_from == "Main Balance") {
          console.log(
            "6075607",
            Number(user.main_balance) - Number(req.body.amount)
          );
          user.update({
            // main_balance: Number(user.main_balance) - Number(req.body.amount),
            main_balance: Number(user.main_balance),
          });
        }

        console.log("605605", user);
        db.transaction_history
          .findOne({
            where: {
              user_id: user.id,
              date: req.body.date,
            },
          })
          .then((result) => {
            console.log("kkkkkkkk", result);
            result.update({
              status: "Complete",
            });
            res.json({ status: "Success" });
            // if (result.description.includes('Transfer from')){
            //     console.log("615")
            //     result.update({
            //         status: "Complete",
            //         main_balance: Number(result.main_balance) + Number(req.body.amount)
            //     })
            //     res.json({ status: "Success" })
            // }
            // else if (result.description.includes('Transfer to')){
            //     console.log("623")
            //     result.update({
            //         status: "Complete",
            //         main_balance: Number(result.main_balance) - Number(req.body.amount)
            //     })
            //     res.json({ status: "Success" })
            // }
          })
          .catch((err) => {
            console.log("eeeerrrr");
            res.json({ error: err });
          });
      })
      .catch((err) => {
        console.log("eeeerrrr");
        res.json({ error: err });
      });
  });

  app.post("/poker_automation_fail", (req, res) => {
    console.log("poker called called called fail", req.body.email);
    db.users
      .findOne({
        where: {
          email: req.body.email,
        },
      })
      .then((user) => {
        console.log("71771717171717171717", user);
        // if (req.body.transfer_to == "Main Balance"){

        // }
        // else if (req.body.transfer_from == "Main Balance"){

        // }

        db.transaction_history
          .findOne({
            where: {
              user_id: user.id,
              date: req.body.date,
            },
          })
          .then((result) => {
            console.log("this is okay", result);
            console.log("okok", result.description);
            if (result.description.includes("Transfer to")) {
              console.log("735735735735735");
              user.update({
                main_balance:
                  Number(user.main_balance) + Number(req.body.amount),
              });
              result
                .update({
                  status: "Fail",
                  main_balance:
                    Number(result.main_balance) + Number(req.body.amount),
                })
                .then((success) => {
                  res.json({ status: "Success" });
                });
            } else if (result.description.includes("Transfer from")) {
              console.log("750750750");
              user.update({
                main_balance:
                  Number(user.main_balance) - Number(req.body.amount),
              });
              result
                .update({
                  status: "Fail",
                  main_balance:
                    Number(result.main_balance) - Number(req.body.amount),
                })
                .then((success) => {
                  res.json({ status: "Success" });
                });
            }
          })
          .catch((err) => {
            console.log("eeeerrrr");
            res.json({ error: err });
          });
      })
      .catch((err) => {
        console.log("eeeerrrr");
        res.json({ error: err });
      });
  });
};
