/* eslint-disable */

/***********/
/* Init    */
/***********/
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync("db.json");
const db = low(adapter);

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const server = express();
const jsonParser = bodyParser.json();
const whitelist = ["http://localhost:3000"];
server.use(cors({ origin: whitelist, credentials: true }));

const port = 8000;
const host = process.env.HOST;

/***********/
/* Routes  */
/***********/
server.get("/db", (req, res) => {
  res.json(db);
});

server.get("/levels", (req, res) => {
  const data = db.get("levels").value();
  res.json({ payload: data });
});

server.post("/levels", jsonParser, (req, res) => {
  const level = req.body;
  const data = db.get("levels").value() || [];

  const newData = data.concat(level);
  const d = db.set("levels", newData).write();

  res.json(d);
});

/* 404 */
server.get("*", (req, res) => {
  res.status(404);
});

server.listen(port, host, err => {
  console.log("Server is running on http://" + host + ":" + port);
});
