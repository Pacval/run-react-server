const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bodyParser = require("body-parser");
const exitHook = require("exit-hook");

const app = express();
const jsonParser = bodyParser.json();
const whitelist = ["http://localhost:3000"];
app.use(cors({ origin: whitelist, credentials: true }));

// listen on server
const server = app.listen(8000, () => {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Server is running on http://" + host + ":" + port);
});

// open database file
let db = new sqlite3.Database("./runDB.db", sqlite3.OPEN_READWRITE, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Connected to the Run SQlite database.");
});

// Close database and server connection when any shut down is called
exitHook(() => {
  db.close(err => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Close the database connection.");
  });
  server.close();
});

/* ---------- API ---------- */

// get all story levels
app.get("/story-level", (req, res) => {
  const sql = "SELECT * FROM story_level";
  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
    res.json({ payload: rows });
  });
});

// get all community levels
app.get("/community-level", (req, res) => {
  const sql = "SELECT * FROM community_level";
  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
    res.json({ payload: rows });
  });
});

app.post("/community-level", jsonParser, (req, res) => {
  const sql =
    "INSERT INTO community_level (name, creator, content) VALUES (?,?,?)";
  const params = [req.body.name, req.body.creator, req.body.content];

  db.run(sql, params, (err, result) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json(params);
  });
});

app.post("/user", jsonParser, (req, res) => {
  // const user = req.body;
  // const data = userTable.get("users").value() || [];
  // const newData = data.concat(user);
  // const d = userTable.set("users", newData).write();
  // res.json(d);
});

app.post("/authenticate", jsonParser, (req, res) => {
  // const user = req.body;
  // const data = userTable.get("users").value() || [];
  // const d = data.find(
  //   u => u.username === user.username && u.password === user.password
  // );
  // res.json({ payload: !!d ? d.username : null });
});

/* 404 */
app.get("*", (req, res) => {
  res.status(404);
});
