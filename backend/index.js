require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db"); // Importă conexiunea MySQL
const authRoutes = require("./routes/auth");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Rute
app.use("/api/auth", authRoutes);

// Pornire server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serverul rulează pe portul ${PORT}`));