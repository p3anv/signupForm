
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(express.json());
const User = require("./models/user")

const router = express.Router();
const port = 4000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var uri = "mongodb://127.0.0.1:27017/myDatabase";

mongoose.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true });

const connection = mongoose.connection;

connection.once("open", function() {
  console.log("MongoDB database connection established successfully");
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/login.html");
  });
  

app.use("/", router);

router.post("/employees", (req, res) => {
    // console.log(req.body);
    if (!req.body.name || !req.body.email) {
      return res.status(400).send("Please fill in both name and email fields.");
    }
  
    const employee = new employees({
      name: req.body.name,
      email: req.body.email
    });
  
    employee.save()
      .then(result => {
        console.log(req.body);
        res.send("Employee added successfully!");
      })
      .catch(err => {
        console.error(err);
        console.log(req.body);

        res.status(500).send("Error adding employee");
      });
  });
  //SIGNUP
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

//LOGIN 
app.post("/login", (req, res) => {
    User.findOne({ username: req.body.username })
      .then(user => {
        if (user && user.password === req.body.password) {
          // User found and password matches
          res.json({ success: true, message: "Login successful" });
        } else {
          // User not found or password doesn't match
          res.status(401).json({ success: false, message: "Invalid username or password" });
        }
      })
      .catch(err => {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
      });
  });
  
app.listen(port, function() {
  console.log("Server is running on Port: " + port);
});