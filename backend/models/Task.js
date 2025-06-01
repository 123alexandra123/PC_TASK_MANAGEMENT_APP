const db = require('../db');

//calculul SLA deadline
const calculateSLADeadline = (priority) => {
  const now = new Date();
  let hours;

  // seteaza orele de sla bazate pe prioritate
  switch (priority) {
    case 'Critical': hours = 12; break; 
    case 'High': hours = 27; break;     
    case 'Medium': hours = 51; break;    
    case 'Low': hours = 75; break;
    default: hours = 48;
  }

  //calculeaza SLA deadline și ajusteaza pentru fusul orar
  const slaDeadline = new Date(now.getTime() + (hours * 60 * 60 * 1000));

  return slaDeadline
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ');
};

// creare task 
const createTask = (taskData) => {
  return new Promise((resolve, reject) => {
    const slaDeadline = calculateSLADeadline(taskData.priority);

    const query = `
      INSERT INTO tasks (
        title, description, priority, deadline, 
        created_at, completed, assigned_to, user_id, sla_deadline
      ) 
      VALUES (?, ?, ?, ?, NOW(), false, ?, ?, ?)
    `;

    const values = [
      taskData.title,
      taskData.description || null,
      taskData.priority,
      taskData.deadline,
      parseInt(taskData.assigned_to, 10), 
      parseInt(taskData.user_id, 10),     
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
  const { title, description, deadline, priority, completed, assigned_to, user_id, status } = updatedTask;

  return new Promise((resolve, reject) => {
    const fetchQuery = `SELECT priority, sla_deadline FROM tasks WHERE id = ?`;
    db.query(fetchQuery, [id], (err, results) => {
      if (err) return reject(err);

      const currentPriority = results[0]?.priority;
      const currentSlaDeadline = results[0]?.sla_deadline;
      let query = `UPDATE tasks SET title = ?, description = ?, deadline = ?, priority = ?, completed = ?, assigned_to = ?, user_id = ?, status = ?`;
      let values = [title, description, deadline, priority, completed, assigned_to, user_id, status];

      // daca status este 'resolved', seteaza resolved_at și in_sla
      if (status === 'resolved') {
        const now = new Date();
        const resolvedAt = now.toISOString().slice(0, 19).replace('T', ' ');
        // verifica daca este in SLA
        const inSla = currentSlaDeadline && new Date(resolvedAt) <= new Date(currentSlaDeadline) ? 1 : 0;
        query += `, resolved_at = ?, in_sla = ?`;
        values.push(resolvedAt, inSla);
      } else if (status === 'in progress') {
        //daca se revine la in progress reseteaza resolved_at si in_sla
        query += `, resolved_at = NULL, in_sla = NULL`;
      }

      //daca prioritatea s-a schimbat recalculeaza SLA deadline
      if (priority && priority !== currentPriority) {
        query += ', sla_deadline = ?';
        values.push(calculateSLADeadline(priority));
      }

      query += ' WHERE id = ?';
      values.push(id);

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

// functie pentru a obtine task-urile paginate cu filtrare
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

// functie pentru a obtine numarul total de task-uri
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
