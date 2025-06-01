const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createUser, findUserByEmail, getAllUsers } = require("../models/User");
const { getAllTeams } = require("../models/Team");
const db = require("../db"); 

const router = express.Router();

//face conexiunea la baza de date
router.get("/", (req, res) => {
  res.send("Auth API funcționează!");
});

//se face route pentru a aduga o echipa
router.get("/teams", async (req, res) => {
  try {
    const teams = await getAllTeams();
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//se face route pentru a adauga un utilizator
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, group } = req.body;

    if (!name || !email || !password || !group) {
      return res.status(400).json({ message: "Toate câmpurile sunt necesare!" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const defaultImage = "/uploads/default-avatar.png";
    const isAdmin = group.toLowerCase() === 'administrator' ? 1 : 0;

    await createUser(name, email, passwordHash, group, isAdmin, defaultImage);
    res.status(201).json({ message: "Utilizator înregistrat!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//se face route pentru a loga un utilizator
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

    const token = jwt.sign({ id: user.id, group: user.group }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        group: user.group,
        imageUrl: user.profile_image || null,
        is_admin: user.is_admin, 
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//se face route pentru a lua toti utilizatorii
router.get("/users", async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//se face route pentru a actualiza grupul unui utilizator
router.patch("/users/:id", async (req, res) => {
  const userId = req.params.id;
  const { group } = req.body;

  try {
    await db.query("UPDATE users SET `group` = ? WHERE id = ?", [group, userId]);
    res.status(200).json({ message: "Grup actualizat cu succes" });
  } catch (err) {
    console.error("Eroare la actualizarea grupului:", err);
    res.status(500).json({ message: "Eroare la actualizarea utilizatorului" });
  }
});

module.exports = router;
