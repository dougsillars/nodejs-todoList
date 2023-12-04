const express = require("express");
const kenx = require("knex");
const dotenv = require('dotenv');
dotenv.config();

const db = kenx({
  client: "pg",
  connection: {
    host: process.env.DB_SERVER,
    port: 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB
  }
});

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");

app.use(express.static("public"));

// res.render
app.get("/", (req, res) => {
  db.select("*")
    .from("task")
    .then(data => {
      res.render("index", { todos: data });
    })
    .catch(err => res.status(400).json(err));
});

// create new task
app.post("/addTask", (req, res) => {
  const { textTodo } = req.body;
  db("task")
    .insert({ task: textTodo })
    .returning("*")
    .then(todo => {
      res.redirect("/");
    })
    .catch(err => {
      res.status(400).json({ message: "unable to create a new task" });
    });
});

app.put("/moveTaskDone", (req, res) => {
  const { name, id } = req.body;

  if (name === "todo") {
    db("task")
      .where("id", "=", id)
      .update("status", 1)
      .returning("status")
      .then(task => {res.json(task[0])});
  } else {
    db("task")
      .where("id", "=", id)
      .update("status", 0)
      .returning("status")
      .then(task => {res.json(task[0])});
  }
});

app.listen(8080, () => console.log("app is running on port 8080"));

