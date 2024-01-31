const mongoose = require("mongoose");

// const employeeSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true // Ensure unique email addresses
//   }
// });

const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  });
  
const User = mongoose.model("User", userSchema);
module.exports = User;
module.exports = mongoose.model("Employee", employeeSchema);
