const express = require("express");
const {
  createTask,
  getAllTasks,
  updateTask,
  deleteTask,
  toggleTaskCompleted
} = require("../models/Task");

const router = express.Router();

// add task
router.post("/", async (req, res) => {
  try {
    const result = await createTask(req.body);
    res.status(201).json({ message: "Task added", taskId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// obtine toate task-urile
router.get("/", async (req, res) => {
  try {
    const tasks = await getAllTasks();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// update task
router.put("/:id", async (req, res) => {
  try {
    await updateTask(req.params.id, req.body);
    res.json({ message: "Task updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// delete task
router.delete("/:id", async (req, res) => {
  try {
    await deleteTask(req.params.id);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// toggle task completion
router.patch("/:id/toggle", async (req, res) => {
  try {
    const task = await toggleTaskCompleted(req.params.id);
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
