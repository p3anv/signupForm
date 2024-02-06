const express = require("express");
const router = express.Router();
const path = require('path');
const User = require('./models/user');
const verifyToken = require('./verifyToken');

// console.log(require('fs').readdirSync(path.join(__dirname, '../middleware')));
const isAuthenticated = require('./middleware/isAuthenticated'); // Adjust the path accordingly

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
    phone:req.body.phone,
    fullName: req.body.fullName,
    dob: req.body.dob,
    gender: req.body.gender,
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





// function isAuthenticated(req, res, next) {
//   console.log("isAuthenticated middleware called");
//   if (req.isAuthenticated()) {
//     return next();
//   }
//   res.redirect('/login');
// }

router.get('/dashboard', isAuthenticated,(req, res) => {
  res.render('dashboard', { user: req.user });
});

router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Error during logout:', err);
      return res.redirect('/');
    }
    res.clearCookie('token');
    res.redirect('/');
  });
});

module.exports = router;
// module.exports.isAuthenticated = isAuthenticated;