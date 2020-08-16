"use strict";
const cors = require("cors");

module.exports = (app, db) => {
  app.use(cors());
  app.post("/update_poker_automation_queue", (req, res) => {
    console.log("automation queue called from automation backend");
    res.json({ status: "success" });
    // db.users
    //   .findAll({
    //     order: [["id", "DESC"]],
    //   })
    //   .then((users) => {
    //     console.log("database from db", users);
    //     res.send(users);
    //   })
    //   .catch((err) => {
    //     console.log("eeeerrrr");
    //     res.status(400).json({ error: err });
    //   });
  });
}