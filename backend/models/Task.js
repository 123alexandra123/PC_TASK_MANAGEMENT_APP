const db = require('../db');

// add task
const createTask = (task) => {
  const { title, description, deadline, priority } = task;
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO tasks (title, description, deadline, priority)
      VALUES (?, ?, ?, ?)
    `;
    db.query(query, [title, description, deadline, priority], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

// obtine toate task-urile
const getAllTasks = () => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM tasks", (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// update task
const updateTask = (id, updatedTask) => {
    console.log("Updating task:", updatedTask); // Debugging
    const { title, description, deadline, priority, completed } = updatedTask;
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE tasks
        SET title = ?, description = ?, deadline = ?, priority = ?, completed = ?
        WHERE id = ?
      `;
      db.query(query, [title, description, deadline, priority, completed, id], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  };

// delete task
const deleteTask = (id) => {
  return new Promise((resolve, reject) => {
    db.query("DELETE FROM tasks WHERE id = ?", [id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

// toggle task completion
const toggleTaskCompleted = (id) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE tasks SET completed = NOT completed WHERE id = ?
    `;
    db.query(query, [id], (err, result) => {
      if (err) return reject(err);
      db.query("SELECT * FROM tasks WHERE id = ?", [id], (err, result) => {
        if (err) return reject(err);
        resolve(result[0]);
      });
    });
  });
};

module.exports = {
  createTask,
  getAllTasks,
  updateTask,
  deleteTask,
  toggleTaskCompleted
};
