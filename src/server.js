/* 
!!! START OF INFO !!!

database name = nodejs_login

table 1 for registered users = name: register
register (name, username, password, email)

CREATE TABLE IF NOT EXISTS `register` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;



table 2 for saved comments = name: comments
comments (name, message)

CREATE TABLE IF NOT EXISTS `comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `message` varchar(2000) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;



Or Change values to connect to your own database below!

!!! END OF INFO !!!
*/

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
  host: "localhost", // change to correct adress
  user: "root", // change to correct location
  password: "", // change to correct password
  database: "nodejs_login", // change to correct DB
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
app.use(express.static(path.join(__dirname, "../static")));

// load HTML pages
app.get("/", function (request, response) {
  response.sendFile(path.join(__dirname, "../public/index.html"));
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
          console.log("User login request accepted");
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
    //prepared statements to avoid SQL-injection
    const userName = request.body.name;
    const userNick = request.body.newuser;
    const userPW = request.body.newpassword;
    const userMail = request.body.email;

    if (!userName) {
      console.log("Missing values in registration form");
      response.send("Fyll i ALLA fält.");
    } else if (!userNick) {
      console.log("Missing values in registration form");
      response.send("Fyll i ALLA fält.");
    } else if (!userPW) {
      console.log("Missing values in registration form");
      response.send("Fyll i ALLA fält.");
    } else if (!userMail) {
      console.log("Missing values in registration form");
      response.send("Fyll i ALLA fält.");
    } else {
      //Insert user into DB.
      const regUser = `INSERT INTO register (name, username, password, email) 
    VALUES (?, ?, ?, ?)`; // connect to correct DB for registered users
      //collect all values to One
      const allValues = [userName, userNick, userPW, userMail];
      connectDB.query(regUser, allValues, function (error, result) {
        if (error) {
          console.log("Error with registration!", error);
          response.send(
            "Tyvärr har det uppstått något problem med registreringen."
          );
        } else {
          response.redirect("/");
          console.log("User registered");
        }
      });
    }
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
      const retriveComments = `SELECT * FROM comments`; // connect to correct DB for comments
      connectDB.query(retriveComments, function (error, results) {
        if (error) {
          console.log("Error with retriving comments", error);
          response.send("Kommentarer kan inte visas för tillfället.");
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
security and no empty input !
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
    } else if (!message) {
      console.log("Message value is missing.");
      response.send("Skriv ett meddelanden!");
      return;
    } else {
      // if no empty values, save info to DB.
      const insertComment = `INSERT INTO comments (name, message) values (?, ?)`; //connect to correct DB for comments
      const commentValue = [request.session.username, request.body.message];

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
      console.log("Logout not possible, user is here forever.", error);
    }
    response.sendFile(path.join(__dirname + "/index.html"));
    console.log("User logout request accepted");
  });
});
