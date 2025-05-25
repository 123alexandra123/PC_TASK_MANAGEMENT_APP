const express = require('express');
const db = require('../db');
const router = express.Router();

// GET /api/users/:userId/incomplete-tasks-count
router.get('/:userId/incomplete-tasks-count', async (req, res) => {
  const userId = req.params.userId;
  try {
    const [rows] = await db.promise().query(
      'SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND completed = 0',
      [userId]
    );
    res.json({ count: rows[0].count });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
