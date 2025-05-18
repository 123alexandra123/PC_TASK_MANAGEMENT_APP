require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// 🔁 Servirea fișierelor statice pentru imagini
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🔁 Conexiune DB și rute
const db = require("./db");
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const uploadRoutes = require("./routes/upload");

// Rute API
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/upload", uploadRoutes);

// Pornire server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Serverul rulează pe portul ${PORT}`));
