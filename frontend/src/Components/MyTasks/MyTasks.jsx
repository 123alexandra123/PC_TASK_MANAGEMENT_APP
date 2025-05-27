import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../Navbar/Navbar';
import EditTaskModal from '../EditTaskModal/EditTaskModal';
import {
  updateTask,
  deleteTaskById,
  toggleTaskStatus
} from '../../services/taskService';
import './MyTasks.css';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const tasksPerPage = 20;
  const tableContainerRef = useRef(null);

  const user = JSON.parse(sessionStorage.getItem('user'));
  const isAdmin = sessionStorage.getItem('is_admin') === '1';

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      if (tableContainerRef.current) {
        tableContainerRef.current.scrollTop = 0;
      }
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${user.id}/tasks?page=${currentPage}&limit=${tasksPerPage}`
      );
      const data = await response.json();

      if (Array.isArray(data.tasks)) {
        setTasks(data.tasks);
        setTotalPages(data.totalPages);
      } else {
        console.error('Invalid data:', data);
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [currentPage]);

  const handleTaskUpdated = async () => {
    await fetchTasks();
  };

  const handleEditTask = async (updatedTask) => {
    try {
      await updateTask(updatedTask.id, updatedTask);
      handleTaskUpdated();
      setShowEditModal(false);
    } catch (err) {
      console.error("Failed to edit task:", err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTaskById(taskId);
      const isLastTaskOnPage = tasks.length === 1;
      setTasks(tasks.filter(task => task.id !== taskId));
      if (isLastTaskOnPage && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleToggleComplete = async (id) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!isAdmin) {
        alert('Doar adminul poate închide un task!');
        return;
      }
      await updateTask(id, { ...task, status: 'closed', completed: true });
      handleTaskUpdated();
    } catch (err) {
      console.error("Failed to close task:", err);
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === 'createdAt') return new Date(a.created_at) - new Date(b.created_at);
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'priority') {
      const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
      return order[a.priority] - order[b.priority];
    }
    return 0;
  });

  const filteredTasks = filterPriority === 'all'
    ? sortedTasks
    : sortedTasks.filter(task => task.priority === filterPriority);

  return (
    <div>
      <Navbar />
      <div className="main-content container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <h2 className="fw-bold text-white">🎯 My Tasks</h2>
        </div>

        <div className="d-flex gap-3 mb-4 flex-wrap">
          <select className="form-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="createdAt">Sort by creation date</option>
            <option value="priority">Sort by priority</option>
            <option value="title">Sort alphabetically</option>
          </select>
          <select className="form-select" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
            <option value="all">All priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="task-table-wrapper">
          <div
            ref={tableContainerRef}
            className="table-responsive"
            style={{ maxHeight: '400px', overflowY: 'auto' }}
          >
            <table className="table table-dark table-bordered table-hover align-middle text-white">
              <thead style={{ position: 'sticky', top: 0, backgroundColor: '#1f1f1f', zIndex: 2 }}>
                <tr>
                  <th>✔</th>
                  <th>Title & SLA</th>
                  <th>Description</th>
                  <th>Created</th>
                  <th>Team</th>
                  <th>Priority</th>
                  <th>SLA Time</th>
                  <th>Status</th>
                  <th>In SLA</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center text-white">No tasks found for current filter.</td>
                  </tr>
                ) : (
                  filteredTasks.map(task => (
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
                        <div className={`fw-bold ${task.completed ? 'completed-task-title' : ''}`}>{task.title}</div>
                        <span className={`sla-badge ${
                          task.completed ? 'sla-completed' :
                          task.sla?.status === 'Breached' ? 'sla-breached' : 'sla-waiting'
                        }`}>
                          {task.sla?.status || 'Waiting'}
                        </span>
                      </td>
                      <td className="small">{task.description}</td>
                      <td>
                        {new Date(task.created_at).toLocaleDateString()}
                        <br />
                        <span style={{ fontSize: '0.85em', color: '#aaa' }}>
                          {new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td>{task.team_name || 'Unassigned'}{task.assigned_user_name ? ` / ${task.assigned_user_name}` : ''}</td>
                      <td>{task.priority}</td>
                      <td>{task.sla?.timeRemaining || 0}h</td>
                      <td>{task.status}</td>
                      <td>
                        <span style={{ color: task.in_sla === 1 ? '#4caf50' : task.in_sla === 0 ? '#f44336' : '#aaa', fontWeight: 'bold' }}>
                          {task.in_sla === null ? '-' : (task.in_sla ? 'In SLA' : 'Out of SLA')}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedTask(task);
                              setShowEditModal(true);
                            }}
                            className="btn btn-outline-primary btn-sm"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteTask(task.id)} 
                            className="btn btn-outline-danger btn-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-4 gap-2">
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ⬅ Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`btn btn-sm ${currentPage === i + 1 ? 'btn-light' : 'btn-outline-light'}`}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next ➡
            </button>
          </div>
        )}
      </div>

      <EditTaskModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEditTask}
        task={selectedTask}
      />
    </div>
  );
};

export default MyTasks;
