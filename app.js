const mongoose = require("mongoose");
const express = require("express");
const app = express();
const ejs = require("ejs");
const path = require('path');
const bodyParser = require("body-parser");
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require("./models/user");
const route = require('./route'); // Import the route module

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var uri = "mongodb://127.0.0.1:27017/myDatabase";
mongoose.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true });
const connection = mongoose.connection;

connection.once("open", function () {
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

app.use("/", route); // Use the router from route.js
app.post("/login", passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login',
  failureFlash: true // Enable if using flash messages for failure
}));

app.use(express.static(path.join(__dirname, 'public')));

const port = 4000;

app.listen(port, function () {
  console.log("Server is running on Port: " + port);
});
