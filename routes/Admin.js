"use strict";
const cors = require("cors");

module.exports = (app, db) => {
  app.use(cors());
  app.post("/users", (req, res) => {
    console.log("users called from frontend");
    db.users
      .findAll({
        order: [["id", "DESC"]],
      })
      .then((users) => {
        console.log("database from db", users);
        res.send(users);
      })
      .catch((err) => {
        console.log("eeeerrrr");
        res.status(400).json({ error: err });
      });
  });

  app.post("/p2p_transfer", (req, res) => {
    console.log("users called from frontend");
    db.p2p_transfer
      .findAll({
        order: [["id", "DESC"]],
      })
      .then((data) => {
        console.log("database from db", data);
        res.send(data);
      })
      .catch((err) => {
        console.log("eeeerrrr");
        res.status(400).json({ error: err });
      });
  });

  app.post("/cashout_pending", (req, res) => {
    console.log("users called from frontend");
    db.cashout
      .findAll({
        order: [["id", "DESC"]],
        where: {
          Status: "Pending",
        },
      })
      .then((data) => {
        console.log("database from db", data);
        res.send(data);
      })
      .catch((err) => {
        console.log("eeeerrrr");
        res.status(400).json({ error: err });
      });
  });

  app.post("/cashout_history", (req, res) => {
    console.log("users cashout complete called from frontend");
    db.cashout
      .findAll({
        order: [["id", "DESC"]],
      })
      .then((data) => {
        console.log("database from db", data);
        res.send(data);
      })
      .catch((err) => {
        console.log("eeeerrrr");
        res.status(400).json({ error: err });
      });
  });

  app.post("/accept_cashout", (req, res) => {
    console.log("users called from frontend");
    console.log(req.body.date);
    db.cashout
      .findOne({
        where: {
          date: req.body.date,
          email: req.body.email,
        },
      })
      .then((cashout_data) => {
        cashout_data.update({
          status: "Complete",
        });
        console.log("dddoneone");
        // res.json({status: 'complete'})
      })
      .catch((err) => {
        console.log("eeeerrrr");
        res.status(400).json({ error: err });
      });

    db.users
      .findOne({
        where: {
          email: req.body.email,
        },
      })
      .then((user) => {
        console.log("787878787878", user.id);
        db.transaction_history
          .findOne({
            where: {
              date: req.body.date,
              user_id: user.id,
            },
          })
          .then((transaction_history_data) => {
            console.log("878787878787", transaction_history_data);
            transaction_history_data.update({
              description: "Cashout - Complete",
              status: "Complete",
            });
            res.json({ status: "complete" });
          })
          .catch((err) => {
            console.log("eeeerrrr");
            res.status(400).json({ error: err });
          });
      });
  });

  app.post("/decline_cashout", (req, res) => {
    console.log("users called from frontend");
    db.cashout
      .findOne({
        where: {
          date: req.body.date,
          email: req.body.email,
        },
      })
      .then((cashout_data) => {
        cashout_data.update({
          status: "Declined",
        });
        console.log("dddoneone");
        // res.json({status: 'complete'})
      })
      .catch((err) => {
        console.log("eeeerrrr");
        res.status(400).json({ error: err });
      });

    db.users
      .findOne({
        where: {
          email: req.body.email,
        },
      })
      .then((user) => {
        console.log("787878787878", user.id);
        db.transaction_history
          .findOne({
            where: {
              date: req.body.date,
              user_id: user.id,
            },
          })
          .then((transaction_history_data) => {
            console.log("878787878787", transaction_history_data);
            transaction_history_data.update({
              description: "Cashout - Declined",
              status: "Declined",
            });
            res.json({ status: "declined" });
          })
          .catch((err) => {
            console.log("eeeerrrr");
            res.status(400).json({ error: err });
          });
      });
  });

  app.post("/deposit_pending", (req, res) => {
    console.log("users called from frontend");
    db.deposit
      .findAll({
        order: [["id", "DESC"]],
        where: {
          Status: "Pending",
        },
      })
      .then((data) => {
        console.log("database from db", data);
        res.send(data);
      })
      .catch((err) => {
        console.log("eeeerrrr");
        res.status(400).json({ error: err });
      });
  });

  app.post("/deposit_history", (req, res) => {
    console.log("users cashout complete called from frontend");
    db.deposit
      .findAll({
        order: [["id", "DESC"]],
      })
      .then((data) => {
        console.log("database from db", data);
        res.send(data);
      })
      .catch((err) => {
        console.log("eeeerrrr");
        res.status(400).json({ error: err });
      });
  });

  app.post("/transaction_history_from_admin", (req, res) => {
    console.log("history called from frontend", req.body.email);
    db.users
      .findOne({
        where: {
          email: req.body.email,
        },
      })
      .then((user) => {
        console.log("219219219219");
        db.transaction_history
          .findAll({
            order: [["id", "DESC"]],
            where: {
              user_id: user.id,
            },
          })
          .then((histories) => {
            console.log("database from db", histories);
            res.send(histories);
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
  });

  app.post("/deposit_admin", (req, res) => {
    console.log("history called from frontend", req.body.email);
    var today = new Date();
    db.users
      .findOne({
        where: {
          email: req.body.email,
        },
      })
      .then((user) => {
        console.log("219219219219");
        user.update({
          main_balance: Number(user.main_balance) + Number(req.body.amount),
        });

        const deposit_data = {
          date: today,
          email: req.body.email,
          amount: req.body.amount,
          cash_tag: "",
          status: "Complete",
        };
        db.deposit.create(deposit_data);

        const transaction_history_deposit_data = {
          date: today,
          amount: req.body.amount,
          description: "Manual Deposit",
          status: "Complete",
          main_balance: user.main_balance,
          user_id: user.id,
        };
        db.transaction_history
          .create(transaction_history_deposit_data)
          .then((histories) => {
            console.log("database from db", histories);
            res.send(histories);
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
  });

  app.post("/cashout_admin", (req, res) => {
    var today = new Date();
    console.log("cashout called from frontend");
    db.users
      .findOne({
        where: {
          email: req.body.email,
        },
      })
      .then((user) => {
        const cashout_date = {
          date: today,
          email: req.body.email,
          amount: req.body.amount,
          cash_tag: "",
          status: "Complete",
        };
        db.cashout.create(cashout_date);
        console.log("261261261", user.main_balance);
        var update_main_balance =
          Number(user.main_balance) - Number(req.body.amount);
        console.log("ggg", update_main_balance);
        user.update({
          main_balance: update_main_balance,
        });
        console.log("265265265265");
        const transaction_history_cashout_data = {
          date: today,
          amount: req.body.amount,
          description: "Manual Cashout",
          status: "Complete",
          main_balance: user.main_balance,
          user_id: user.id,
        };
        db.transaction_history
          .create(transaction_history_cashout_data)
          .then((data) => {
            res.json({ status: "Transfered" });
          });
      })
      .catch((err) => {
        console.log("eeeerrrr");
        res.json({ error: err });
      });
  });

  app.post("/get_complete_transfer", (req, res) => {
    console.log("transfer complete fucntion is called");
    db.transfer
      .findAll({
        order: [["id", "DESC"]],
      })
      .then((data) => {
        console.log("database from db", data);
        res.send(data);
      })
      .catch((err) => {
        console.log("eeeerrrr");
        res.status(400).json({ error: err });
      });
  });

  app.post("/get_pending_transfer", (req, res) => {
    console.log("transfer pending fucntion is called");
    db.transfer
      .findAll({
        order: [["id", "DESC"]],
        where: {
          status: "Pending",
        },
      })
      .then((data) => {
        console.log("database fddddddddddddddddddrom db", data);
        res.send(data);
      })
      .catch((err) => {
        console.log("eeeerrrr");
        res.status(400).json({ error: err });
      });
  });

  app.post("/update_connected_account", (req, res) => {
    console.log("updated connected account is called")
    db.poker_account
      .findOne({
        where: {
          id: req.body.id,
          email: req.body.email,
        }
      })
      .then((result) => {
        console.log("ths is s s", result)
        result.update({
          account_name: req.body.account_name,
          username: req.body.username,
          user_id: req.body.user_id,
        })
        .then(() => {
          res.json({ status: "success" });
        })
      })
      .catch((err) => {
        console.log("eeeerrrr");
        res.status(400).json({ error: err });
      });
  })
};


