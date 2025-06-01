require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();


// middleware
app.use(express.json());
app.use(cors());

// pentru a servi fișiere statice (de exemplu, încărcări de poze)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// conexiune la baza de date si importarea rutelor
const db = require("./db");
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const uploadRoutes = require("./routes/upload");
const userTasksRouter = require('./routes/userTasks');

// rutele API
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/upload", uploadRoutes);
app.use('/api/teams', require('./routes/teams'));
app.use('/api/users', userTasksRouter);

// pornire server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serverul rulează pe portul ${PORT}`));
