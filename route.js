const express = require("express");
const router = express.Router();
const path = require('path');
const User = require('./models/user');

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/signup', (req, res) => {
  res.render('signup');
});

router.post('/signup', (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  });

  newUser.save()
    .then(() => {
      console.log(req.body);
      res.send("User signed up successfully!");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error saving user to the database");
    });
});

function isAuthenticated(req, res, next) {
  console.log("isAuthenticated middleware called")
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

router.get('/dashboard', isAuthenticated, (req, res) => {
  res.render('dashboard', { user: req.user });
});

module.exports = router;
