const mongoose = require("mongoose");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    pass: {
        type: String,
        // required: true,
      },
    cpass: {
      type: String,
      // required: true,
    },
    googleId: {
      type: String,
    },
    Phone_no: {
      type: String,
    },
    User_desc: {
      type: String,
    },
    
  },
  { timestamps: true }
);




module.exports = mongoose.model("User", userSchema);