const db = require('../db');

// Funcție helper pentru calculul SLA deadline
const calculateSLADeadline = (priority) => {
  const now = new Date(); // This will be our creation time reference
  let hours;
  
  // Set SLA hours based on priority
  switch (priority) {
    case 'High': hours = 28; break;  
    case 'Medium': hours = 52; break; 
    case 'Low': hours = 76; break; 
    default: hours = 48; 
  }

  // Calculate SLA deadline from current time (creation time)
  const slaDeadline = new Date(now.getTime() + hours * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ');

  return slaDeadline;
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

// obtine toate task-urile
const getAllTasks = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT tasks.*, teams.name AS team_name
      FROM tasks
      LEFT JOIN teams ON tasks.assigned_to = teams.id
    `;
    db.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results);
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
const getPaginatedTasks = (page, limit) => {
  return new Promise((resolve, reject) => {
    const currentPage = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 5);
    const offset = (currentPage - 1) * limitNum;
    
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
const getTotalTaskCount = () => {
  return new Promise((resolve, reject) => {
    const query = "SELECT COUNT(*) as count FROM tasks";
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error counting tasks:', err);
        return reject(err);
      }
      resolve(results[0].count);
    });
  });
};

module.exports = {
  createTask,
  getAllTasks,
  updateTask,
  deleteTask,
  toggleTaskCompleted,
  getPaginatedTasks,
  getTotalTaskCount,
};