const mongoose = require("mongoose");

const dbURI = process.env.MONGO_URI || "mongodb+srv://ajmalmayanad97:Ajmal12%40@cluster0.yy1t7.mongodb.net/";

const connectDB = async () => {
  try {
    await mongoose.connect(dbURI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  }
};

module.exports = connectDB;
