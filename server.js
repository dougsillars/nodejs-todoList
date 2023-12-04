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

//todo init table
async function createTaskTable() {
  try {
    // Check if the "task" table exists
    const tableExists = await db.schema.hasTable('task');

    if (!tableExists) {
      // Create the "task" table if it doesn't exist
      await db.schema.createTable('task', (table) => {
        table.increments('id').primary();
        table.text('task').unique();
        table.integer('status').defaultTo(0);
      });

      console.log('The "task" table has been created.');
    } else {
      console.log('The "task" table already exists.');
    }
  } catch (error) {
    console.error('Error creating the "task" table:', error);
  } 
}

// Call the function to create the "task" table
createTaskTable();

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

