// init requirements
const mysql = require("mysql");
const express = require("express");
const session = require("express-session");
const path = require("path");
const ejs = require("ejs");
const app = express();
const port = 8080;

app.listen(port);
app.set("view engine", "ejs");

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

/* // init express env
const app = express();
const port = 8080; */

/* app.listen(port);
app.set("view engine", "ejs"); */

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

// load HTML pages
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
      "SELECT * FROM register WHERE username = ? AND password = ?",
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

// load welcome page from views-folder in .ejs format for logged in user and show saved comments
app.get("/welcome", function (request, response) {
  if (request.session.loggedin) {
    connectDB.connect(function (error) {
      const retriveComments = `SELECT * FROM comments`;
      connectDB.query(retriveComments, function (error, results) {
        if (error) {
          console.log("Error with retriving comments", error);
          response.send("We cant retrive comments at this moment.");
        } else {
          response.render("welcome", {
            username: request.session.username,
            comments: results,
          });
        }
      });
    });
  } else {
    response.redirect("/login");
  }
});

// registration function w (little) SQL-injection protection thru prepared statements
app.post("/register", function (request, response) {
  connectDB.connect(function (error) {
    const registerUser = `INSERT INTO register (name, username, password, email)
    VALUES (?, ?, ?, ?)`;
    const regValues = [
      request.body.name,
      request.body.newuser,
      request.body.newpassword,
      request.body.email,
    ];
    console.log(registerUser);
    connectDB.query(registerUser, regValues, function (error, result) {
      if (error) {
        console.log("Error w registration", error);
        response.send("Error w registration");
      } else {
        response.redirect("/");
      }
    });
  });
});

// Guestbook
app.post("/guestbook", function (request, response) {
  connectDB.connect(function (error) {
    const saveComment = `INSERT INTO comments (name, message) values (?, ?)`;
    const commentValue = [request.body.guest, request.body.message];
    console.log(saveComment);
    connectDB.query(saveComment, commentValue, function (error, result) {
      if (error) {
        console.log("error while leaving comment, not saved.", error);
        response.send("Comment not saved.");
      } else {
        response.redirect("welcome");
      }
    });
  });
});

// Display ALL saved comments from DB table "comments"
/* app.get("/", function (request, response) {
  connectDB.connect(function (error) {
    const retriveComments = `SELECT * FROM comments`;
    connectDB.query(retriveComments, function (error, results) {
      console.log(results);
      if (error) {
        console.log("Error with retriving comments", error);
        response.send(
          "We are having trouble showing you the comments, sorry for that!"
        );
      } else {
        response.render("welcome", { comments: results });
      }
    });
  });
});
 */
