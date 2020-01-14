const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bodyParser = require("body-parser");
const exitHook = require("exit-hook");
const bcrypt = require("bcryptjs");
const moment = require("moment");

const app = express();
const jsonParser = bodyParser.json();
app.use(cors({ origin: "*" })); // a modifier plus tard si jamais on met tout ça sur un serveur

// listen on server
const server = app.listen(8000, () => {
  const host = server.address().address;
  const port = server.address().port;
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

// get all progress story levels
// params : userId
app.get("/user-progress-story/:userId", (req, res) => {
  const sql = "SELECT * FROM user_progress_story WHERE user_id = ?";
  const params = [req.params.userId];
  db.all(sql, params, (err, rows) => {
    if (err) {
      throw err;
    }
    res.json({
      payload: rows.map(row => ({
        id: row.level_id,
        score: row.score
      }))
    });
  });
});

// post user complete story level
// params : userId, storyLevelId, score
app.post("/user-progress-story", jsonParser, (req, res) => {
  const sql = "INSERT INTO user_progress_story VALUES (?,?,?)";
  const params = [req.body.userId, req.body.storyLevelId, req.body.score];

  db.run(sql, params, (err, result) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json();
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

// post new community level
// params : name / creator / content
app.post("/community-level", jsonParser, (req, res) => {
  const sql =
    "INSERT INTO community_level (name, creator, content) VALUES (?,?,?)";
  const params = [req.body.name, req.body.creator, req.body.content];

  db.run(sql, params, (err, result) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json();
  });
});

// new user
// params : username / password
app.post("/user", jsonParser, (req, res) => {
  const sql =
    "INSERT INTO user (username, password, pseudo, date_creation) VALUES (?,?,?,?)";

  const salt = bcrypt.genSaltSync(10);
  const hashPwd = bcrypt.hashSync(req.body.password, salt);
  const dateNow = moment().format("DD-MM-YYYY");
  const params = [req.body.username, hashPwd, req.body.username, dateNow];
  const response = {
    pseudo: req.body.username,
    date_creation: dateNow
  };

  db.run(sql, params, (err, result) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ payload: response });
  });
});

// authentication
// params : username / password
app.post("/authenticate", jsonParser, (req, res) => {
  const sql = "SELECT * FROM user WHERE username = ?";
  const params = [req.body.username];
  const password = req.body.password;

  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ message: "Cet utilisateur n'existe pas" });
    } else {
      // user trouvé
      if (bcrypt.compareSync(password, row.password)) {
        // mdp ok
        res.json({
          payload: {
            id: row.id,
            pseudo: row.pseudo,
            date_creation: row.date_creation
          }
        });
      } else {
        // mauvais mdp
        res.status(400).json({ message: "Mot de passe incorrect" });
      }
    }
  });
});

/* 404 */
app.get("*", (req, res) => {
  res.status(404);
});
