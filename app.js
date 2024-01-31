const mongoose = require("mongoose");
const express = require("express");
const app = express();
const ejs = require("ejs");
const path = require('path');
const bodyParser = require("body-parser");
app.use(express.json());
const User = require("./models/user");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

const router = express.Router();
const port = 4000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


var uri = "mongodb://127.0.0.1:27017/myDatabase";

mongoose.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true });

const connection = mongoose.connection;

connection.once("open", function() {
  console.log("MongoDB database connection established successfully");
});



// Passport Configuration
passport.use(new LocalStrategy(
  function (username, password, done) {
    User.findOne({ username: username }).exec()
      .then(user => {
        if (!user || user.password !== password) {
          return done(null, false, { message: 'Invalid credentials' });
        }
        return done(null, user);
      })
      .catch(err => {
        return done(err);
      });
  }
));
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id).exec()
    .then(user => {
      done(null, user);
    })
    .catch(err => {
      done(err);
    });
});

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());



app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});


// Assuming you have a login.html file in your views folder
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});



app.use(express.static(path.join(__dirname, 'public')));
app.use("/", router);

// SIGNUP
app.post("/signup", (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  });

  newUser
    .save()
    .then(() => {
      console.log(req.body);
      res.send("User signed up successfully!");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error saving user to database");
    });
});

// LOGIN 
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});


app.post("/login", passport.authenticate('local', { successRedirect: '/dashboard', failureRedirect: '/login' }));

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}


app.listen(port, function() {
  console.log("Server is running on Port: " + port);
});

app.get("/dashboard", isAuthenticated, (req, res) => {
  res.render("dashboard", { user: req.user });
});