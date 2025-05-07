const db = require('../db');

// Obține toate echipele
const getAllTeams = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM teams', (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

module.exports = {
  getAllTeams,
};