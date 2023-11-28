/*
====================================
Init requirements
====================================
*/

const mysql = require("mysql");
const express = require("express");
const session = require("express-session");
const path = require("path");
const ejs = require("ejs");
const app = express();
const port = 8080;

app.listen(port);
app.set("view engine", "ejs");

/*
====================================
Establish connection to mySQL DB.
====================================
*/
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

/*
====================================
App requirements
====================================
*/

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

/*
====================================
Auth for login
====================================
*/

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
    response.send("Missing value in inputfield.");
    response.end();
  }
});

/*
====================================
registration function 
w (little) SQL-injection protection 
thru prepared statements
====================================
*/

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

/*
====================================
load welcome page from views-folder
 in .ejs format for logged in user 
 and show saved comments
====================================
*/

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

/*
====================================
Guestbook with mySQL injection 
security and no empty input
====================================
*/

app.post("/guestbook", function (request, response) {
  connectDB.connect(function (error) {
    //Get values from comment input
    const guest = request.body.guest;
    const message = request.body.message;
    //check to secure no empty input with logical operator "!".
    if (!guest && !message) {
      console.log("Both fields are required for leaving a comment!");
      response.send("Vänligen fyll i båda fälten!");
      return;
    } else if (!guest) {
      console.log("Name value is missing.");
      response.send("Fyll i ditt namn.");
      return;
    } else if (!message) {
      console.log("Message value is missing.");
      response.send("Skriv ett meddelanden!");
      return;
    } else {
      // if no empty values, save info to DB.
      const insertComment = `INSERT INTO comments (name, message) values (?, ?)`;
      const commentValue = [request.body.guest, request.body.message];

      connectDB.query(insertComment, commentValue, function (error, result) {
        if (error) {
          console.log("Comment can not be saved at this moment, sorry.", error);
          response.send("Kommentaren går inte att spara just nu. Beklagar.");
        } else {
          response.redirect("welcome");
        }
      });
    }
  });
});

/*
====================================
User logout
====================================
*/

app.get("/logout", function (request, response) {
  request.session.destroy(function (error) {
    if (error) {
      console.log("Logout not possible, your are here forever.", error);
    }
    response.sendFile(path.join(__dirname + "/index.html"));
    console.log("User logged out");
  });
});
