const db = require('../db');

// Funcție helper pentru calculul SLA deadline
const calculateSLADeadline = (priority) => {
  const now = new Date();
  let hours;

  // Set SLA hours based on priority
  switch (priority) {
    case 'Critical': hours = 12; break; // Most urgent - 12 hours
    case 'High': hours = 27; break;     // 24 hours for High
    case 'Medium': hours = 51; break;    
    case 'Low': hours = 75; break;
    default: hours = 48;
  }

  // Calculate SLA deadline and adjust for timezone
  const slaDeadline = new Date(now.getTime() + (hours * 60 * 60 * 1000));

  return slaDeadline
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ');
};

// Creare task (o singură implementare)
const createTask = (taskData) => {
  return new Promise((resolve, reject) => {
    const slaDeadline = calculateSLADeadline(taskData.priority);

    const query = `
      INSERT INTO tasks (
        title, description, priority, deadline, 
        created_at, completed, assigned_to, sla_deadline
      ) 
      VALUES (?, ?, ?, ?, NOW(), false, ?, ?)
    `;

    const values = [
      taskData.title,
      taskData.description || null,
      taskData.priority,
      taskData.deadline,
      parseInt(taskData.assigned_to, 10),
      slaDeadline
    ];

    db.query(query, values, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

// update task
const updateTask = (id, updatedTask) => {
  const { title, description, deadline, priority, completed } = updatedTask;

  return new Promise((resolve, reject) => {
    const fetchQuery = `SELECT priority FROM tasks WHERE id = ?`;
    db.query(fetchQuery, [id], (err, results) => {
      if (err) return reject(err);

      const currentPriority = results[0]?.priority;
      const query = `
        UPDATE tasks
        SET title = ?, description = ?, deadline = ?, priority = ?, completed = ?
        ${priority && priority !== currentPriority ? ', sla_deadline = ?' : ''}
        WHERE id = ?
      `;

      const values = priority && priority !== currentPriority
        ? [title, description, deadline, priority, completed, calculateSLADeadline(priority), id]
        : [title, description, deadline, priority, completed, id];

      db.query(query, values, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
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
    const query = `UPDATE tasks SET completed = NOT completed WHERE id = ?`;
    db.query(query, [id], (err) => {
      if (err) return reject(err);
      db.query("SELECT * FROM tasks WHERE id = ?", [id], (err, result) => {
        if (err) return reject(err);
        resolve(result[0]);
      });
    });
  });
};

// funcție pentru a obține task-urile paginate cu filtrare
const getPaginatedTasks = (page, limit = 20, filter = 'all') => {
  return new Promise((resolve, reject) => {
    const currentPage = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 20);
    const offset = (currentPage - 1) * limitNum;

    let filterCondition = '';
    if (filter === 'completed') {
      filterCondition = 'WHERE t.completed = 1';
    } else if (filter === 'pending') {
      filterCondition = 'WHERE t.completed = 0';
    }

    const query = `
      SELECT 
        t.*, teams.name as team_name,
        CASE 
          WHEN t.completed = 1 THEN 'Completed'
          WHEN NOW() > t.sla_deadline THEN 'Breached'
          ELSE 'Waiting'
        END as sla_status,
        TIMESTAMPDIFF(HOUR, NOW(), t.sla_deadline) as hours_remaining
      FROM tasks t
      LEFT JOIN teams ON t.assigned_to = teams.id
      ${filterCondition}
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
    `;

    db.query(query, [limitNum, offset], (err, results) => {
      if (err) return reject(err);

      const tasksWithSla = results.map(task => ({
        ...task,
        sla: {
          status: task.sla_status,
          timeRemaining: Math.max(0, task.hours_remaining || 0)
        }
      }));

      resolve(tasksWithSla);
    });
  });
};

// funcție pentru a obține numărul total de task-uri
const getTotalTaskCount = (filter = 'all') => {
  return new Promise((resolve, reject) => {
    let filterCondition = '';
    if (filter === 'completed') {
      filterCondition = 'WHERE completed = 1';
    } else if (filter === 'pending') {
      filterCondition = 'WHERE completed = 0';
    }

    const query = `SELECT COUNT(*) as count FROM tasks ${filterCondition}`;

    db.query(query, (err, results) => {
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
