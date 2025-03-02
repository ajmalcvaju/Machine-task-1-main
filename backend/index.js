const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const parsingRoutes = require("./routes/parsingRoutes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

connectDB();
app.use(express.static(path.join(__dirname, "/frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/parsed-data", parsingRoutes);
app.use(errorHandler);

const PORT = 5000;

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
