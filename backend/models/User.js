const db = require("../db");

const createUser = (name, email, passwordHash, group, isAdmin, profileImage = null) => {
  return new Promise((resolve, reject) => {
    const query = "INSERT INTO users (name, email, password_hash, `group`, is_admin, profile_image) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(query, [name, email, passwordHash, group, isAdmin, profileImage], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const findUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
};

const findUserById = (id) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM users WHERE id = ?";
    db.query(query, [id], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
};

const updateProfileImage = (userId, imageUrl) => {
  return new Promise((resolve, reject) => {
    const query = "UPDATE users SET profile_image = ? WHERE id = ?";
    db.query(query, [imageUrl, userId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

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
  getAllUsers, // ✅ adăugat aici
};
