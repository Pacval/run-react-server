const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const levelstoryAdapter = new FileSync("level-story.json");
const levelstory = low(levelstoryAdapter);

const leveluserAdapter = new FileSync("level-user.json");
const leveluser = low(leveluserAdapter);

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const server = express();
const jsonParser = bodyParser.json();
const whitelist = ["http://localhost:3000"];
server.use(cors({ origin: whitelist, credentials: true }));

const port = 8000;
const host = process.env.HOST;

server.get("/level-story", (req, res) => {
  const data = levelstory.value();
  res.json({ payload: data });
});

server.get("/level-user", (req, res) => {
  const data = leveluser.value();
  res.json({ payload: data });
});

server.post("/level-user", jsonParser, (req, res) => {
  const level = req.body;
  const data = leveluser.value() || [];

  const newData = data.concat(level);
  const d = leveluser.set(newData).write();

  res.json(d);
});

/* 404 */
server.get("*", (req, res) => {
  res.status(404);
});

server.listen(port, host, err => {
  console.log("Server is running on http://" + host + ":" + port);
});
