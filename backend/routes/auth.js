const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createUser, findUserByEmail, getAllUsers } = require("../models/User");
const { getAllTeams } = require("../models/Team");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Auth API funcționează!");
});

router.get("/teams", async (req, res) => {
  try {
    const teams = await getAllTeams();
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, role, password, group } = req.body;

    if (!name || !email || !password || !group) {
      return res.status(400).json({ message: "Toate câmpurile sunt necesare!" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const defaultImage = "/uploads/default-avatar.png";

    await createUser(name, email, role || "user", passwordHash, group, defaultImage);
    res.status(201).json({ message: "Utilizator înregistrat!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Toate câmpurile sunt necesare!" });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "Utilizator inexistent!" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Parolă incorectă!" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        group: user.group,
        imageUrl: user.profile_image || null,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await getAllUsers(); // ✅ funcția este acum corect importată și definită
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
