const express = require("express");
const {
  createTask,
  getAllTasks,
  updateTask,
  deleteTask,
  toggleTaskCompleted,
  getPaginatedTasks,
  getTotalTaskCount
} = require("../models/Task");

const router = express.Router();

// Helper function for SLA calculation
const calculateSLADeadline = (priority) => {
  const now = new Date();
  switch (priority) {
    case 'High':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24
    case 'Medium':
      return new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48
    case 'Low':
      return new Date(now.getTime() + 72 * 60 * 60 * 1000); // 72
    default:
      return new Date(now.getTime() + 48 * 60 * 60 * 1000); // default 48
  }
};

// Helper function for checking SLA status
const checkSLAStatus = (task) => {
  const now = new Date();
  const slaDeadline = new Date(task.sla_deadline);
  
  if (task.completed) {
    return 'Completed';
  }
  
  return 'Breached';  // Everything not completed is considered breached
};
// Get all tasks with pagination and filtering
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 5, filter } = req.query;
    const offset = (page - 1) * limit;

    const tasks = await getPaginatedTasks(offset, parseInt(limit), filter);
    
    // Add SLA information to each task
    const tasksWithSLA = tasks.map(task => ({
      ...task,
      sla: {
        deadline: task.sla_deadline,
        status: checkSLAStatus(task),
        timeRemaining: Math.max(0, Math.floor(
          (new Date(task.sla_deadline) - new Date()) / (1000 * 60 * 60)
        ))
      }
    }));

    const totalTasks = await getTotalTaskCount(filter);

    res.json({
      tasks: tasksWithSLA,
      totalPages: Math.ceil(totalTasks / limit),
      currentPage: parseInt(page),
      slaMetrics: {
        onTrack: tasksWithSLA.filter(t => t.sla.status === 'On Track').length,
        atRisk: tasksWithSLA.filter(t => t.sla.status === 'At Risk').length,
        breached: tasksWithSLA.filter(t => t.sla.status === 'Breached').length,
        completed: tasksWithSLA.filter(t => t.sla.status === 'Completed').length
      }
    });
  } catch (err) {
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
      assigned_to: req.body.assigned_to,
      sla_deadline: slaDeadline
    };

    const result = await createTask(taskData);
    res.status(201).json({ 
      message: "Task added", 
      taskId: result.insertId,
      slaDeadline: slaDeadline
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update task
router.put("/:id", async (req, res) => {
  try {
    const updatedTask = {
      ...req.body,
      sla_deadline: req.body.priority ? calculateSLADeadline(req.body.priority) : undefined
    };

    await updateTask(req.params.id, updatedTask);
    res.json({ 
      message: "Task updated",
      slaDeadline: updatedTask.sla_deadline
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
    const updatedTask = {
      ...task,
      sla: {
        status: checkSLAStatus(task),
        deadline: task.sla_deadline,
        timeRemaining: Math.max(0, Math.floor(
          (new Date(task.sla_deadline) - new Date()) / (1000 * 60 * 60)
        ))
      }
    };
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get SLA statistics
router.get("/sla-stats", async (req, res) => {
  try {
    const tasks = await getAllTasks();
    const tasksWithSLA = tasks.map(task => ({
      ...task,
      slaStatus: checkSLAStatus(task)
    }));

    const stats = {
      total: tasks.length,
      byStatus: {
        onTrack: tasksWithSLA.filter(t => t.slaStatus === 'On Track').length,
        atRisk: tasksWithSLA.filter(t => t.slaStatus === 'At Risk').length,
        breached: tasksWithSLA.filter(t => t.slaStatus === 'Breached').length,
        completed: tasksWithSLA.filter(t => t.slaStatus === 'Completed').length
      },
      byPriority: {
        High: tasksWithSLA.filter(t => t.priority === 'High').length,
        Medium: tasksWithSLA.filter(t => t.priority === 'Medium').length,
        Low: tasksWithSLA.filter(t => t.priority === 'Low').length
      }
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;