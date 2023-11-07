const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");

const UploadRoute = require("./routes/UploadRoute");
const app = express();

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send("Hi");
});
app.use(cors({
  origin: 'http://localhost:3000',
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected...");
    
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

start();
app.use(require('./routes/userRoutes'));
app.use(require('./routes/tutorialRoute'));
app.use(UploadRoute);

app.listen(PORT, () => {
    console.log(`Server started at port: ${PORT}`);
  });