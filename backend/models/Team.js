const db = require("../db");

// Get all teams
const getAllTeams = () => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM teams", (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// Add a new team
const addTeam = (name, description) => {
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO teams (name, description) VALUES (?, ?)",
      [name, description],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};

// Update team name and description
const updateTeam = (originalName, newName, description) => {
  return new Promise((resolve, reject) => {
    db.query(
      "UPDATE teams SET name = ?, description = ? WHERE name = ?",
      [newName, description, originalName],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};

// Delete a team
const deleteTeam = (name) => {
  return new Promise((resolve, reject) => {
    db.query(
      "DELETE FROM teams WHERE name = ?",
      [name],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};

// Get users by team id
const getUsersByTeamId = (teamId) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT id, name FROM users WHERE `group` = (SELECT name FROM teams WHERE id = ?)",
      [teamId],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
};

module.exports = {
  getAllTeams,
  addTeam,
  updateTeam,
  deleteTeam,
  getUsersByTeamId,
};
