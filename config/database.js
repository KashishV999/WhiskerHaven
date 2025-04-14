//Connection to mongoDB using mongoose
const mongoose = require("mongoose");

const connectDB = async () => {
    await mongoose
    .connect("mongodb://127.0.0.1:27017/WhiskersWay")
    .then(() => {
      console.log("MongoDB connected successfully");
    })
    .catch((err) => {
      console.log("MongoDB connection failed", err);
    });
};

module.exports = connectDB;