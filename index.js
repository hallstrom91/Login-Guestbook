// init requirements
const mysql = require("mysql");
const express = require("express");
const session = require("express-session");
const path = require("path");
const ejs = require("ejs");

//Establish connection to mySQL DB.
const connectDB = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "nodejs_login",
});

connectDB.connect((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("MySQL connected!");
  }
});

// init express env
const app = express();
const port = 8080;

app.listen(port);
app.set("view engine", "ejs");

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "static")));

// load loginpage
app.get("/", function (request, response) {
  response.sendFile(path.join(__dirname + "/index.html"));
});

//redirect test
/* app.get("/welcome", function (request, response) {
  response.render("welcome.ejs");
}); */

//auth for login
app.post("/login", function (request, response) {
  //get info from login inputfields
  let username = request.body.username;
  let password = request.body.password;
  // check values of inputfields to DB
  if (username && password) {
    // connection to DB
    connectDB.query(
      "SELECT * FROM users WHERE username = ? AND password = ?",
      [username, password],
      function (error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
          request.session.loggedin = true;
          request.session.username = username;
          // redirect to page
          response.redirect("/welcome");
        } else {
          response.send("Incorrect credentials");
        }
        response.end();
      }
    );
  } else {
    response.send("No values in input!");
    response.end();
  }
});

app.get("/welcome", function (request, response) {
  if (request.session.loggedin) {
    response.render("welcome", { username: request.session.username });
  } else {
    response.redirect("/login");
  }
});

//redirect to user-page
/* app.get("/welcome", function (request, response) {
  if (request.session.loggedin) {
    response.sendFile(path.join(__dirname + "/welcome.html"));
    response.send("Hello" + request.session.username);
  } else {
    response.send("You are not welcome!");
  }
  response.end();
}); */

/* app.get("/home", function (request, response) {
  if (request.session.loggedin) {
    response.sendFile(path.join(__dirname + "/welcome.html"));
    response.send("Welcome", +request.session.username + "!");
  } else {
    response.send("Your not logged in!");
  }
  response.end();
});
 */
