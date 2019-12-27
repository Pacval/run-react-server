const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const storyLevelAdapter = new FileSync("./tables/story-levels.json");
const storyLevelTable = low(storyLevelAdapter);

const communityLevelAdapter = new FileSync("./tables/community-levels.json");
const communityLevelTable = low(communityLevelAdapter);

const userAdapter = new FileSync("./tables/users.json");
const userTable = low(userAdapter);

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const server = express();
const jsonParser = bodyParser.json();
const whitelist = ["http://localhost:3000"];
server.use(cors({ origin: whitelist, credentials: true }));

const port = 8000;
const host = process.env.HOST;

server.get("/story-level", (req, res) => {
  const data = storyLevelTable.get("levels").value();
  res.json({ payload: data });
});

server.get("/community-level", (req, res) => {
  const data = communityLevelTable.get("levels").value();
  res.json({ payload: data });
});

server.post("/community-level", jsonParser, (req, res) => {
  const level = req.body;
  const data = communityLevelTable.get("levels").value() || [];

  const newData = data.concat(level);
  const d = communityLevelTable.set("levels", newData).write();

  res.json(d);
});

server.get("/user", (req, res) => {
  const data = userTable.get("users").value();
  res.json({ payload: data });
});

server.post("/user", jsonParser, (req, res) => {
  const user = req.body;
  const data = userTable.get("users").value() || [];

  const newData = data.concat(user);
  const d = userTable.set("users", newData).write();

  res.json(d);
});

server.post("/authenticate", jsonParser, (req, res) => {
  const user = req.body;
  const data = userTable.get("users").value() || [];

  const d = data.find(
    u => u.username === user.username && u.password === user.password
  );
  res.json({ payload: !!d ? d.username : null });
});

/* 404 */
server.get("*", (req, res) => {
  res.status(404);
});

server.listen(port, host, err => {
  console.log("Server is running on http://" + host + ":" + port);
});
