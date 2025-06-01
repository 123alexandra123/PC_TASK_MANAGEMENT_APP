const db = require("../db");

// se creează un utilizator nou
const createUser = (name, email, passwordHash, group, isAdmin, profileImage = null) => {
  return new Promise((resolve, reject) => {
    const query = "INSERT INTO users (name, email, password_hash, `group`, is_admin, profile_image) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(query, [name, email, passwordHash, group, isAdmin, profileImage], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

//se cauta un utilizator dupa email
const findUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
};

// se cauta un utilizator dupa id
const findUserById = (id) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM users WHERE id = ?";
    db.query(query, [id], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
};

//se actualizeaza profilul utilizatorului cu o nouă imagine
const updateProfileImage = (userId, imageUrl) => {
  return new Promise((resolve, reject) => {
    const query = "UPDATE users SET profile_image = ? WHERE id = ?";
    db.query(query, [imageUrl, userId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// se iau toti utilizatorii din baza de date
const getAllUsers = () => {
  return new Promise((resolve, reject) => {
    const query = "SELECT id, name, email, `group` FROM users";
    db.query(query, (err, results) => {
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
  getAllUsers, 
};
