// const express = require("express")
// const app = express.Router()
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const User = require("../models/User");
const mailer = require("nodemailer");
//const { where } = require("sequelize/types");
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
      main_balance: 0,
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
          var message_read_status = false      // this is for showing initial message to new users
          if (user.popup_message_read_status == true) {
            message_read_status = true
          }
          //update user login status
          user.update({
            login_status: true
          })
          
          if (message_read_status == false){
            user.update({
              popup_message_read_status: true
            })
          }

          if (bcrypt.compareSync(req.body.password, user.password)) {
            console.log("dfdsfasfdsdf");
            let token = jwt.sign(user.dataValues, process.env.SECRET_KEY, {
              expiresIn: 1440,
            });
            console.log(token);
            console.log("this is messgae status", message_read_status)
            res.send({token: token, msg_read_status: message_read_status })
            // res.send(token);
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

  app.post("/update_login_status", (req, res) => {
    console.log("here is update login status")
    db.users
      .findOne({
        where: {
          email: req.body.email
        }
      })
      .then((user) => {
        console.log("this is login then");
        if (user) {
          console.log("ddeeeeeeeeeeeeeeeee", user.password);
          //update user login status
          user.update({
            login_status: false
          })
          .then(() => {
            console.log("dddddfff", user)
            res.json({ status: "success" });
          })
          .catch((err) => {
            console.log("eeeerrrr");
            res.status(400).json({ error: err });
          });

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

  app.post("/check_poker_complete_or_fail", (req, res) => {
    console.log("login called from frontenddddd");
    db.users
      .findOne({
        where: {
          email: req.body.email,
        },
      })
      .then((user) => {
        console.log("nnnnnnnnnnnnn", user)
        db.transfer
          .findAll({
            limit: 1,
            where: {
              email: req.body.email,
              status: "Pending",
            },
            order: [['id', 'DESC']]
          })
          .then((transfer_data) => {
            console.log("112112112", transfer_data[0].status)
            if (!transfer_data || transfer_data[0].status != "Pending"){
              res.json({ status: "none" });
            }
            else if (transfer_data[0].status == "Pending"){
              res.json({ date: transfer_data[0].date });
            }
          })
      })
      .catch((err) => {
        console.log("eeeerrrr");
        res.status(400).json({ error: err });
      });
  });

  app.post("/update_status_when_login", (req, res) => {
    console.log("login update_status_when_login from frontenddddd");
    db.users
      .findOne({
        where: {
          email: req.body.email,
        },
      })
      .then((user) => {
        console.log("nnnnnnndddnnnnnn", user)
        db.transfer
          .findAll({
            limit: 1,
            where: {
              email: req.body.email,
              status: "Pending",
            },
            order: [['id', 'DESC']]
          })
          .then((transfer_data) => {
            console.log("112112112", transfer_data[0].status)
            // if (!transfer_data || transfer_data[0].status != "Pending"){
            //   res.json({ status: "none" });
            // }
            // else if (transfer_data[0].status == "Pending"){
            //   res.json({ date: transfer_data[0].date });
            // }
            if (req.body.status == "success"){
              transfer_data[0].update({
                status: "Complete"
              })
            }
            else if (req.body.status == "fail" || req.body.status == "error"){
              transfer_data[0].update({
                status: "Fail"
              })
            }

            // transaction history data update
            db.transaction_history
              .findAll({
                limit: 1,
                where: {
                  user_id: user.id,
                  date: req.body.date,
                  status: "Pending",
                },
                order: [['id', 'DESC']]
              })
              .then((history_data) => {
                if (req.body.status == "success"){
                  history_data[0].update({
                    status: "Complete"
                  })
                }
                else if (req.body.status == "fail" || req.body.status == "error"){
                  history_data[0].update({
                    status: "Fail"
                  })
                }
                console.log("here is is is okokokokok")
                
              })
              .then(() =>{
                res.json({ status: "Updated" });
              })
          })
      })
      .catch((err) => {
        console.log("eeeerrrr");
        res.status(400).json({ error: err });
      });
  });


  app.post("/reset_password", (req, res) => {
    console.log("reset password is called" + req.body.email);
    const email = req.body.email;
    db.users
      .findOne({
        where: {
          email: email,
        },
      })
      .then((user) => {
        if (!user) {
          res.json({ error: "No user found with that email address." });
        } else {
          var transporter = mailer.createTransport({
            service: "gmail",
            auth: {
              user: "elitedev416@gmail.com",
              pass: "Kiuj1234+",
            },
          });
          var mailOptions = {
            from: "elitedev416@gmail.com",
            to: email,
            subject: "Reset Password from PokerApp",
            text: "Test",
          };
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log("Email sent: " + info.response);
            }
          });
        }
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
          return
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
                cash_tag: req.body.cash_tag,
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
        if (user.status == "Complete" || user.status == "Declined"){
          res.json({ status: "This transaction can no longer be cancelled." });
        }
        else{
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
        }
        
      })
      .catch((err) => {
        console.log("eeeerrrr");
        res.json({ error: err });
      });
  });

  app.post("/deposit_cancel", (req, res) => {
    console.log("deposit cancel called from frontend", req.body);
    console.log(req.body.cash_tag, "ddd");
    db.users
      .findOne({
        where: {
          email: req.body.email,
        },
      })
      .then((user) => {
        console.log("okok", user);
        console.log("311311311");
        db.transaction_history
          .destroy({
            where: {
              date: req.body.time,
              user_id: user.id,
              amount: req.body.amount,
            },
          })
          .then((cancel_data) => {
            db.deposit
              .destroy({
                where: {
                  date: req.body.time,
                  email: req.body.email,
                  amount: req.body.amount,
                  cash_tag: req.body.cash_tag,
                },
              })
              .then((cancel_deposit_data) => {
                res.json({ status: "success" });
              })
              .catch((err) => {
                console.log("eeefffffferrrr");
                res.status(400).json({ error: err });
              });
          });
      })
      .catch((err) => {
        console.log("eeeerrrrdddd");
        res.status(400).json({ error: err });
      });
  });

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
          description: "Deposit - Cash App",
          status: "Pending",
          main_balance: user.main_balance,
          user_id: user.id,
          type: "cash-deposit"
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
              description: "Deposit - Cash App",
              status: "Complete",
              main_balance:
                Number(transaction_history_data.main_balance) +
                Number(transaction_history_data.amount),
              user_id: transaction_history_data.user_id,
            };
            const new_data_fail = {
              date: today,
              amount: Number(transaction_history_data.amount),
              description: "Deposit - Cash App",
              status: "Fail",
              main_balance: Number(transaction_history_data.main_balance),
              user_id: transaction_history_data.user_id,
            };
            console.log("here is status status", req.body.b_status);
            if (req.body.b_status) {
              console.log("here is successssssssssssssss");
              new_main_balance =
                Number(transaction_history_data.main_balance) +
                Number(transaction_history_data.amount);
              transaction_history_data
                .update({
                  description: "Deposit - Cash App",
                  status: "Complete",
                  main_balance: new_main_balance,
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
                        main_balance: new_main_balance,
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
              console.log(
                "mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm"
              );
              transaction_history_data
                .update({
                  description: "Deposit - Cash App",
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

  app.post("/add_cash_account", (req, res) => {
    var today = new Date();
    const cashAccountData = {
      date: today,
      email: req.body.email,
      account_name: "Cash Tag",
      username: req.body.cash_tag,
      poker_or_cash: "cash",
    };
    db.poker_account
      .findOne({
        where: {
          email: req.body.email,
          username: req.body.cash_tag,
        },
      })
      .then((poker_account) => {
        if (!poker_account) {
          console.log("create a new cash account");
          db.poker_account
            .create(cashAccountData)
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

  app.post("/get_cash_account", (req, res) => {
    console.log("cash called called called", req.body.email);
    db.poker_account
      .findAll({
        order: [["id", "DESC"]],
        where: {
          email: req.body.email,
          poker_or_cash: "cash",
        },
      })
      .then((accounts) => {
        res.send(accounts);
      })
      .catch((err) => {
        console.log("eeeerrrr");
        res.json({ error: err });
      });
  });

  app.post("/bitcoin_pending_save", (req, res) => {
    console.log("bitcoin save backend", req.body)
    var today = new Date();
    db.users
    .findOne({
      where: {
        email: req.body.email,
      },
    })
    .then((user) => {
      const deposit_data = {
        data: today,
        email: req.body.email,
        amount: Number(req.body.amount),
        cash_tag: req.body.invoice_id,
        status: "Pending"
      }
      console.log("hhhhhhffffhh", deposit_data)
      db.deposit
        .create(deposit_data)
        .then((deposit_info) => {
          const bitcoin_pay_pending_data = {
            date: today,
            amount: Number(req.body.amount),
            description: "Deposit - Bitcoin",
            status: "Pending",
            // main_balance: Number(user.main_balance) + Number(req.body.amount),
            main_balance: Number(user.main_balance),
            user_id: user.id,
          };
          db.transaction_history
            .create(bitcoin_pay_pending_data)
            .then((info) => {
              console.log("566666666");
              res.json({ status: "success" });
            })
            .catch((err) => {
              console.log("eeeerrrr");
              res.status(400).json({ error: err });
            });
        })
        .catch((err) => {
          console.log("eeeerrrr");
          res.status(400).json({ error: err });
        });

    })

  }); 

  app.post("/get_notification", (req, res) => {
    console.log("cash called called called", req.body);
    db.deposit
    .findOne({
      where: {
        cash_tag: req.body.id
      }
    })
    .then((deposit_result) => {
      console.log("ggggggg", deposit_result)
      //update deposit status
      deposit_result.update({
        status: req.body.status
      })

      db.transaction_history
      .findOne({
        where: {
          description: "Deposit - Bitcoin",
          amount: Number(deposit_result.amount),
          date: deposit_result.date
        },
      })
      .then((result) => {
        console.log("ressssssssssssssssssssssss", result)

        if (req.body.status == "paid"){ //update the balance
          result.update({
            main_balance: Number(result.main_balance) + Number(deposit_result.amount)
          })
          .then(() => {
            // update the user main balance
            db.users
            .findOne({
              where: {
                id: result.user_id
              }
            })
            .then((user) => {
              user.update({
                main_balance: Number(user.main_balance) + Number(deposit_result.amount)
              })
            })
          })
        }

        result.update({
          status: req.body.status
        })
        .then((info) => {
          console.log("812812")
          res.json({ status: "success" });
        })
        .catch((err) => {
          console.log("eeeerrrr");
          res.status(400).json({ error: err });
        });
      })
    })
    .catch((err) => {
      console.log("eeeerrrr");
      res.status(400).json({ error: err });
    });

  });

  app.post("/add_poker_account", (req, res) => {
    var today = new Date();
    const pokerAccountData = {
      date: today,
      email: req.body.email,
      account_name: req.body.club_name,
      username: req.body.username,
      user_id: req.body.user_id,
      poker_or_cash: "poker",
    };
    db.poker_account
      .findOne({
        where: {
          email: req.body.email,
          account_name: req.body.club_name,
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
          poker_or_cash: "poker",
        },
      })
      .then((accounts) => {
        res.send(accounts);
      })
      .catch((err) => {
        console.log("eeeerrrr");
        res.json({ error: err });
      });
  });

  app.post("/get_all_account", (req, res) => {
    console.log("poker called called called", req.body.email);
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
        res.json({ error: err });
      });
  });

  app.post("/get_cash_account", (req, res) => {
    console.log("cash called called called", req.body.email);
    db.poker_account
      .findAll({
        order: [["id", "DESC"]],
        where: {
          email: req.body.email,
          poker_or_cash: "cash",
        },
      })
      .then((accounts) => {
        console.log("653", accounts);
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
        if (
          req.body.transfer_from == "Main Balance" &&
          Number(req.body.amount > Number(user.main_balance))
        ) {
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
            type: "transfer",
          };
          db.transaction_history
            .create(pokerAutomationTransactionHistoryData_from)
            .then((info) => {
              res.json({ date: today });
              // create a new in automation queue
              //  const poker_automation_data = {
              //    date: today,
              //    email: req.body.email,
              //    transfer_from: req.body.transfer_from,
              //    transfer_to: req.body.transfer_to,
              //    amount: req.body.amount,
              //    status: "Pending",
              //    main_balance: user.main_balance
              //  }

              //  db.automation_queue
              //   .create(poker_automation_data)
              //   .then(() => {
              //     res.json({ date: today });
              //   })

            })
            .catch((err) => {
              console.log("eeeerrrr");
              res.status(400).json({ error: err });
            });
        } else if (req.body.transfer_from == "Main Balance") {

          console.log(Number(user.main_balance) - Number(req.body.amount));
          const pokerAutomationTransactionHistoryData_to = {
            date: today,
            amount: Number(req.body.amount),
            description: "Transfer to " + req.body.transfer_to,
            status: "Pending",
            main_balance: Number(user.main_balance) - Number(req.body.amount),
            // main_balance: Number(user.main_balance),
            user_id: user.id,
            type: "transfer",
          };
          db.transaction_history
            .create(pokerAutomationTransactionHistoryData_to)
            .then((info) => {
              user.update({
                main_balance:
                  Number(user.main_balance) - Number(req.body.amount),
              });
              console.log("566666666");
              res.json({ date: today });

              // const poker_automation_data = {
              //   date: today,
              //   email: req.body.email,
              //   transfer_from: req.body.transfer_from,
              //   transfer_to: req.body.transfer_to,
              //   amount: req.body.amount,
              //   status: "Pending",
              //   main_balance: user.main_balance
              // }

              // db.automation_queue
              //  .create(poker_automation_data)
              //  .then(() => {
              //    res.json({ date: today });
              //  })
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

        db.transfer
          .findOne({
            where: {
              date: req.body.date,
              email: req.body.email
            }
          })
          .then((transfer_result) => {
            transfer_result.update({
              status: "Complete"
            })
          })

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
            if (req.body.transfer_to == "Main Balance") {
              result.update({
                main_balance:
                  Number(result.main_balance) + Number(req.body.amount),
              });
            }
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

        db.transfer
        .findOne({
          where: {
            date: req.body.date,
            email: req.body.email
          }
        })
        .then((transfer_result) => {
          transfer_result.update({
            status: "Fail"
          })
        })

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
                  // Number(user.main_balance) - Number(req.body.amount),
                  Number(user.main_balance),
              });
              result
                .update({
                  status: "Fail",
                  main_balance:
                    // Number(result.main_balance) - Number(req.body.amount),
                    Number(user.main_balance),
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
