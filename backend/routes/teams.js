const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const db = require('../db');

// GET all teams
router.get('/', async (req, res) => {
  try {
    const teams = await Team.getAllTeams();
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST - Add new team
router.post('/', async (req, res) => {
  const { name, description } = req.body;
  if (!name || !description) {
    return res.status(400).json({ message: 'Name and description are required' });
  }

  try {
    await Team.addTeam(name, description);
    res.status(201).json({ message: 'Team added successfully' });
  } catch (error) {
    console.error('Error adding team:', error);
    res.status(500).json({ message: 'Failed to add team' });
  }
});

// PUT - Update team (name and description)
router.put('/:originalName', async (req, res) => {
  const { originalName } = req.params;
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).json({ message: 'Name and description are required' });
  }

  try {
    // Update the team name and description
    await Team.updateTeam(originalName, name, description);

    // If the name has changed, update the users' group reference too
    if (originalName !== name) {
      await db.promise().query(
        "UPDATE users SET `group` = ? WHERE `group` = ?",
        [name, originalName]
      );
    }

    res.json({ message: 'Team updated successfully' });
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ message: 'Failed to update team' });
  }
});

// DELETE - Delete team
router.delete('/:name', async (req, res) => {
  const { name } = req.params;

  try {
    // Check for assigned tasks
    const [tasks] = await db.promise().query(
      "SELECT id FROM tasks WHERE assigned_to = (SELECT id FROM teams WHERE name = ?)",
      [name]
    );
    if (tasks.length > 0) {
      return res.status(400).json({
        message: 'This team has assigned tasks. Please reassign or delete them before deleting the team.'
      });
    }

    // Check for users in the team
    const [users] = await db.promise().query(
      "SELECT id FROM users WHERE `group` = ?",
      [name]
    );
    if (users.length > 0) {
      return res.status(400).json({
        message: 'This team still has members. Please move them to another team before deleting.'
      });
    }

    // All clear: delete the team
    await Team.deleteTeam(name);
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ message: 'Failed to delete team' });
  }
});

// GET users by team id
router.get('/:teamId/users', async (req, res) => {
  try {
    const users = await Team.getUsersByTeamId(req.params.teamId);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users for team:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
