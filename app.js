const mongoose = require("mongoose");
const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const jwtSecretKey = 'your-secret-key';
const isAuthenticated = require('./middleware/isAuthenticated');
const ejs = require("ejs");
const path = require('path');
const bodyParser = require("body-parser");
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require("./models/user");
const route = require('./route'); // Import the route module

app.use(cookieParser());

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
    console.log('Attempting authentication for user:', username);
    User.findOne({ username: username }).exec()
      .then(user => {
        if (!user || user.password !== password) {
          console.log('Authentication failed for user:', username);
          return done(null, false, { message: 'Invalid credentials' });
        }
        console.log('Authentication successful for user:', username);
        return done(null, user);
      })
      .catch(err => {
        console.error('Error during authentication:', err);
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
  secret: 'a5b2f7049e55cfe6bf7b6e46b49d94d67de9e65b7ee46fc1900e9bf9ea75c0a3',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', route); // Use the router from route.js

app.post("/login", passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/error.html',
  failureFlash: true // Enable if using flash messages for failure
}));

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});


// Middleware for verifying a JWT token
app.use('/dashboard', (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/login');
  }

  jwt.verify(token, jwtSecretKey, (err, decoded) => {
    if (err) {
      return res.redirect('/login');
    }
    req.userId = decoded.userId;
    next();
  });
}, isAuthenticated);

app.get('/dashboard', (req, res) => {
  res.render('dashboard', { user: req.user });
});

app.use(express.static(path.join(__dirname, 'public')));

const port = 4000;

app.listen(port, function () {
  console.log("Server is running on Port: " + port);
});
