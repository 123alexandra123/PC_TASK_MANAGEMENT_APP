import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar/Navbar';
import './MyTasks.css';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(sessionStorage.getItem('user'));

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      if (!user) {
        console.error('No user found in session');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/tasks/my-tasks/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');

      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const handleToggleComplete = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}/toggle`, {
        method: 'PATCH'
      });
      if (response.ok) {
        fetchMyTasks();
      }
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="main-content container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-white">🎯 My Tasks</h2>
        </div>

        {loading ? (
          <div className="text-center text-white">Loading...</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-bordered table-hover align-middle">
              <thead>
                <tr>
                  <th>✔</th>
                  <th>Title & SLA</th>
                  <th>Description</th>
                  <th>Created</th>
                  <th>Team</th>
                  <th>Priority</th>
                  <th>SLA Time</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center">No tasks assigned to you.</td>
                  </tr>
                ) : (
                  tasks.map(task => (
                    <tr key={task.id}>
                      <td>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={task.completed}
                          onChange={() => handleToggleComplete(task.id)}
                        />
                      </td>
                      <td>
                        <div className={`fw-bold ${task.completed ? 'completed-task-title' : ''}`}>
                          {task.title}
                        </div>
                        <span className={`sla-badge ${
                          task.completed ? 'sla-completed' :
                          task.sla?.status === 'Breached' ? 'sla-breached' : 'sla-waiting'
                        }`}>
                          {task.sla?.status || 'Waiting'}
                        </span>
                      </td>
                      <td className="small">{task.description}</td>
                      <td>{new Date(task.created_at).toLocaleDateString()}</td>
                      <td>{task.team_name}</td>
                      <td>{task.priority}</td>
                      <td>{task.sla?.timeRemaining || 0}h</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTasks;