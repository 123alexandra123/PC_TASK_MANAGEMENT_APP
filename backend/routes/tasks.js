const express = require("express");
const {
  createTask,
  updateTask,
  deleteTask,
  toggleTaskCompleted,
  getPaginatedTasks,
  getTotalTaskCount
} = require("../models/Task");
const authenticateJWT = require('./authMiddleware');
const connection = require('../db'); // Changed from '../config/database' to '../db'

const router = express.Router();

// Helper function for SLA calculation
const calculateSLADeadline = (priority) => {
  const now = new Date();
  let hours;

  switch (priority) {
    case 'High': hours = 24; break;
    case 'Medium': hours = 48; break;
    case 'Low': hours = 72; break;
    default: hours = 48;
  }

  const deadline = new Date(now.getTime() + hours * 60 * 60 * 1000);
  return deadline.toISOString();
};

// Helper function for checking SLA status
const checkSLAStatus = (task) => {
  const now = new Date();
  const slaDeadline = new Date(task.sla_deadline);

  if (task.completed) {
    return { status: 'Completed', timeRemaining: 0 };
  }

  const timeRemaining = Math.floor((slaDeadline - now) / (1000 * 60 * 60));
  if (timeRemaining > 0) {
    return { status: 'Waiting', timeRemaining };
  }

  return { status: 'Breached', timeRemaining: 0 };
};

// Get all tasks with pagination and filtering
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20; // updated to default 20
    const filter = req.query.filter || 'all';

    const tasks = await getPaginatedTasks(page, limit, filter);
    const totalCount = await getTotalTaskCount(filter);

    res.json({
      tasks,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create new task
router.post("/", async (req, res) => {
  try {
    if (!req.body.priority) {
      return res.status(400).json({ error: "Priority is required for SLA calculation" });
    }

    const slaDeadline = calculateSLADeadline(req.body.priority);
    const taskData = {
      ...req.body,
      sla_deadline: slaDeadline,
      assigned_to: req.body.assigned_to, // team ID
      user_id: req.body.user_id // user ID
    };

    const result = await createTask(taskData);

    const newTask = {
      id: result.insertId,
      ...taskData,
      sla: {
        status: 'Waiting',
        deadline: slaDeadline,
        timeRemaining: Math.floor((new Date(slaDeadline) - new Date()) / (1000 * 60 * 60))
      }
    };

    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update task
router.put("/:id", async (req, res) => {
  try {
    const updatedTask = {
      ...req.body,
      sla_deadline: req.body.priority ? calculateSLADeadline(req.body.priority) : undefined,
      assigned_to: req.body.assigned_to, // team ID
      user_id: req.body.user_id // user ID
    };

    await updateTask(req.params.id, updatedTask);
    const task = { id: req.params.id, ...updatedTask };
    const slaInfo = checkSLAStatus(task);

    res.json({
      ...task,
      sla: {
        status: slaInfo.status,
        deadline: task.sla_deadline,
        timeRemaining: slaInfo.timeRemaining
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete task
router.delete("/:id", async (req, res) => {
  try {
    await deleteTask(req.params.id);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle task completion
router.patch("/:id/toggle", async (req, res) => {
  try {
    const task = await toggleTaskCompleted(req.params.id);
    const slaInfo = checkSLAStatus(task);

    const updatedTask = {
      ...task,
      sla: {
        status: slaInfo.status,
        deadline: task.sla_deadline,
        timeRemaining: slaInfo.timeRemaining
      }
    };

    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/count", async (req, res) => {
  try {
    const count = await getTotalTaskCount();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected route example
router.get('/protected-route', authenticateJWT, (req, res) => {
  res.json({ message: 'This is a protected route.', user: req.user });
});

router.get("/my-tasks/:userId", (req, res) => {
  const userId = req.params.userId;
  const query = `
    SELECT 
      t.*, 
      teams.name as team_name,
      CASE 
        WHEN t.completed = 1 THEN 'Completed'
        WHEN NOW() > t.sla_deadline THEN 'Breached'
        ELSE 'Waiting'
      END as sla_status,
      TIMESTAMPDIFF(HOUR, NOW(), t.sla_deadline) as hours_remaining
    FROM tasks t
    LEFT JOIN teams ON t.assigned_to = teams.id
    WHERE t.assigned_to = ? 
       OR t.assigned_to IN (SELECT team_id FROM user_teams WHERE user_id = ?)
    ORDER BY t.created_at DESC
  `;

  connection.query(query, [userId, userId], (err, tasks) => {
    if (err) {
      console.error('Error fetching tasks:', err);
      return res.status(500).json({ error: err.message });
    }

    const tasksWithSla = tasks.map(task => ({
      ...task,
      sla: {
        status: task.sla_status,
        timeRemaining: Math.max(0, task.hours_remaining || 0)
      }
    }));

    res.json(tasksWithSla);
  });
});

module.exports = router;
