import React, { useEffect, useRef, useState, useCallback } from 'react';
import Navbar from '../Navbar/Navbar';
import { getTasks, deleteTaskById, updateTask } from '../../services/taskService';
import './CompletedTasks.css';

const CompletedTasks = () => {
  const [tasksState, setTasksState] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const tasksPerPage = 20;
  const tableRef = useRef(null);
  const isAdmin = sessionStorage.getItem('is_admin') === '1';

  // încarcă task-urile completate
  const loadTasks = useCallback(async () => {
    try {
      const data = await getTasks(currentPage, tasksPerPage, 'completed');
      setTasksState(data.tasks || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    }
  }, [currentPage]);

  useEffect(() => {
    loadTasks();
    if (tableRef.current) {
      tableRef.current.scrollTop = 0;
    }
  }, [loadTasks]);

  // șterge un task
  const handleDeleteTask = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this task?");
    if (!confirmed) return;

    try {
      await deleteTaskById(id);
      await loadTasks();
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  // marchează un task ca "closed" dacă e admin
  const handleToggleComplete = async (id) => {
    try {
      const task = tasksState.find(t => t.id === id);
      if (!isAdmin) {
        alert('Doar adminul poate închide un task!');
        return;
      }
      await updateTask(id, { ...task, status: 'closed', completed: true });
      await loadTasks();
    } catch (err) {
      console.error("Failed to close task:", err);
    }
  };

  // schimbă pagina
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // HTML
  return (
    <div>
      <Navbar />
      <div className="main-content container mt-4">
        <h2 className="fw-bold text-white mb-4">✅ Completed Tasks</h2>

        <div className="table-responsive task-table-wrapper" style={{ maxHeight: '400px', overflowY: 'auto' }} ref={tableRef}>
          <table className="table table-dark table-bordered table-hover align-middle text-white">
            <thead style={{ position: 'sticky', top: 0, backgroundColor: '#1f1f1f', zIndex: 2 }}>
              <tr>
                <th>✔</th>
                <th>Title & SLA</th>
                <th>Description</th>
                <th>Created</th>
                <th>Priority</th>
                <th>SLA Time</th>
                <th>Status</th>
                <th>In SLA</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasksState.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center text-white">No completed tasks found.</td>
                </tr>
              ) : (
                tasksState.map(task => (
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
                      <div className="fw-bold completed-task-title">{task.title}</div>
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
                    <td>{task.priority}</td>
                    <td>{task.sla?.timeRemaining || 0}h</td>
                    <td>{task.status}</td>
                    <td>
                      <span style={{ color: task.in_sla === 1 ? '#4caf50' : task.in_sla === 0 ? '#f44336' : '#aaa', fontWeight: 'bold' }}>
                        {task.in_sla === null ? '-' : (task.in_sla ? 'In SLA' : 'Out of SLA')}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="btn btn-outline-danger btn-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
    </div>
  );
};

export default CompletedTasks;
