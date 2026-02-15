const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const recipeRoutes = require("./routes/recipeRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/recipes", recipeRoutes);

app.get("/", (req, res) => {
  res.send("Recipe API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
