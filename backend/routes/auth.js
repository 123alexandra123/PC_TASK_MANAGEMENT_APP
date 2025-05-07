const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createUser, findUserByEmail } = require("../models/User");

const router = express.Router();

// testeaza conecxiunea la api
router.get("/", (req, res) => {
  res.send("Auth API funcționează!");
});

// inregistrare utilizator
router.post("/register", async (req, res) => {
  try {
    const { name, email, role, password } = req.body;

    // validare câmpuri
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Toate câmpurile sunt necesare!" });
    }

    // hash parola
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // creare utilizator
    await createUser(name, email, role || "user", passwordHash);

    res.status(201).json({ message: "Utilizator înregistrat!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// login utilizator
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // validare campuri
    if (!email || !password) {
      return res.status(400).json({ message: "Toate câmpurile sunt necesare!" });
    }

    // gasire utilizator
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "Utilizator inexistent!" });
    }

    // verificare parola
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Parolă incorectă!" });
    }

    // generare token
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;