const db = require("../db");

// functie pentru a crea un utilizator nou in baza de date

const createUser = (name, email, role, passwordHash) => {
  return new Promise((resolve, reject) => {
    const query = "INSERT INTO users (name, email, role, password_hash) VALUES (?, ?, ?, ?)";
    db.query(query, [name, email, role, passwordHash], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// functie pentru a gasi un utilizator in baza de date dupa email
const findUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
};

module.exports = { createUser, findUserByEmail };