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

// update task
const updateTask = (id, updatedTask) => {
    console.log("Updating task with ID:", id); // Log ID-ul task-ului
    console.log("Task data:", updatedTask); // Log datele task-ului

    const { title, description, deadline, priority, completed } = updatedTask;
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE tasks
        SET title = ?, description = ?, deadline = ?, priority = ?, completed = ?
        WHERE id = ?
      `;
      db.query(query, [title, description, deadline, priority, completed, id], (err, result) => {
        if (err) {
          console.error("Error executing query:", err); // Log eroarea
          return reject(err);
        }
        console.log("Query result:", result); // Log rezultatul query-ului
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

// funcție pentru a obține task-urile paginate
const getPaginatedTasks = (offset, limit, filter) => {
  return new Promise((resolve, reject) => {
    let query = "SELECT * FROM tasks";
    const params = [];

    if (filter === 'completed') {
      query += " WHERE completed = 1";
    } else if (filter === 'pending') {
      query += " WHERE completed = 0";
    }

    query += " LIMIT ? OFFSET ?";
    params.push(limit, offset);

    db.query(query, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// funcție pentru a obține numărul total de task-uri
const getTotalTaskCount = (filter) => {
  return new Promise((resolve, reject) => {
    let query = "SELECT COUNT(*) AS count FROM tasks";
    const params = [];

    if (filter === 'completed') {
      query += " WHERE completed = 1";
    } else if (filter === 'pending') {
      query += " WHERE completed = 0";
    }

    db.query(query, params, (err, results) => {
      if (err) return reject(err);
      resolve(results[0].count);
    });
  });
};

module.exports = {
  createTask,
  updateTask,
  deleteTask,
  toggleTaskCompleted,
  getPaginatedTasks,
  getTotalTaskCount,
};
