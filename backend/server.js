const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const routes = require("./routes");
app.use("/api", routes);

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Root test
app.get("/", (req, res) => {
  res.send("API is running");
});

// Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);
});
