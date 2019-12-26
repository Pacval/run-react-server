const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const storyLevelAdapter = new FileSync("./tables/story-levels.json");
const storyLevel = low(storyLevelAdapter);

const communityLevelAdapter = new FileSync("./tables/community-levels.json");
const communityLevel = low(communityLevelAdapter);

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
  const data = storyLevel.get("levels").value();
  res.json({ payload: data });
});

server.get("/community-level", (req, res) => {
  const data = communityLevel.get("levels").value();
  res.json({ payload: data });
});

server.post("/community-level", jsonParser, (req, res) => {
  const level = req.body;
  const data = communityLevel.get("levels").value() || [];

  const newData = data.concat(level);
  const d = communityLevel.set("levels", newData).write();

  res.json(d);
});

/* 404 */
server.get("*", (req, res) => {
  res.status(404);
});

server.listen(port, host, err => {
  console.log("Server is running on http://" + host + ":" + port);
});
