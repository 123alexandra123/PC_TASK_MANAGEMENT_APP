const db = require("../db");

// funcție pentru a crea un utilizator nou în baza de date
const createUser = (name, email, role, passwordHash, group, profileImage = null) => {
  return new Promise((resolve, reject) => {
    const query = "INSERT INTO users (name, email, role, password_hash, `group`, profile_image) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(query, [name, email, role, passwordHash, group, profileImage], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// funcție pentru a găsi un utilizator în baza de date după email
const findUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
};

// funcție pentru a găsi un utilizator după ID
const findUserById = (id) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM users WHERE id = ?";
    db.query(query, [id], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
};

// funcție pentru a actualiza imaginea de profil
const updateProfileImage = (userId, imageUrl) => {
  return new Promise((resolve, reject) => {
    const query = "UPDATE users SET profile_image = ? WHERE id = ?";
    db.query(query, [imageUrl, userId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateProfileImage,
};
