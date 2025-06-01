const express = require('express');
const db = require('../db');
const router = express.Router();

// returnează numărul de task-uri incomplete pentru un utilizator
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

// route pentru a obține task-urile unui utilizator specific
router.get('/:userId/tasks', async (req, res) => {
  const userId = req.params.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  try {
    const [tasks] = await db.promise().query(
      `
      SELECT 
        t.*, teams.name as team_name, users.name as assigned_user_name,
        CASE 
          WHEN t.completed = 1 THEN 'Completed'
          WHEN NOW() > t.sla_deadline THEN 'Breached'
          ELSE 'Waiting'
        END as sla_status,
        TIMESTAMPDIFF(HOUR, NOW(), t.sla_deadline) as hours_remaining
      FROM tasks t
      LEFT JOIN teams ON t.assigned_to = teams.id
      LEFT JOIN users ON t.user_id = users.id
      WHERE t.user_id = ?
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
      `,
      [userId, limit, offset]
    );

    const [countResult] = await db.promise().query(
      `SELECT COUNT(*) as count FROM tasks WHERE user_id = ?`, [userId]
    );

    const tasksWithSla = tasks.map(task => ({
      ...task,
      sla: {
        status: task.sla_status,
        timeRemaining: Math.max(0, task.hours_remaining || 0)
      }
    }));

    res.json({
      tasks: tasksWithSla,
      totalPages: Math.ceil(countResult[0].count / limit)
    });
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
