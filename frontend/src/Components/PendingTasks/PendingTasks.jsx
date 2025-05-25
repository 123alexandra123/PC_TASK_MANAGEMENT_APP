import React, { useEffect, useRef, useState, useCallback } from 'react';
import Navbar from '../Navbar/Navbar';
import EditTaskModal from '../EditTaskModal/EditTaskModal';
import {
  getTasks,
  updateTask,
  deleteTaskById,
  toggleTaskStatus
} from '../../services/taskService';
import './PendingTasks.css';

const PendingTasks = () => {
  const [tasksState, setTasksState] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const tasksPerPage = 20;
  const tableRef = useRef(null);

  const loadTasks = useCallback(async () => {
    try {
      const data = await getTasks(currentPage, tasksPerPage, 'pending');
      setTasksState(data.tasks || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    }
  }, [currentPage, tasksPerPage]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleDeleteTask = async (id) => {
    try {
      await deleteTaskById(id);
      await loadTasks();
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const handleToggleComplete = async (id) => {
    try {
      await toggleTaskStatus(id);
      await loadTasks();
    } catch (err) {
      console.error("Failed to toggle complete:", err);
    }
  };

  const handleEditTask = async (updatedTask) => {
    try {
      await updateTask(updatedTask.id, updatedTask);
      setShowEditModal(false);
      await loadTasks();
    } catch (err) {
      console.error("Failed to edit task:", err);
    }
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      if (tableRef.current) {
        tableRef.current.scrollTop = 0;
      }
    }
  };

  return (
    <div>
      <Navbar />
      <div className="main-content container mt-4">
        <h2 className="fw-bold text-white mb-4">🕒 Pending Tasks</h2>
        <div className="table-responsive task-table-wrapper" style={{ maxHeight: '400px', overflowY: 'auto' }} ref={tableRef}>
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasksState.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center text-white">No pending tasks found.</td>
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
                      <div className="fw-bold">{task.title}</div>
                      <span className={`sla-badge ${
                        task.completed ? 'sla-completed' :
                        task.sla?.status === 'Breached' ? 'sla-breached' : 'sla-waiting'
                      }`}>
                        {task.sla?.status || 'Waiting'}
                      </span>
                    </td>
                    <td className="small">{task.description}</td>
                    <td>{new Date(task.created_at).toLocaleDateString()}</td>
                    <td>{task.team_name || 'Unassigned'}{task.assigned_user_name ? ` / ${task.assigned_user_name}` : ''}</td>
                    <td>{task.priority}</td>
                    <td>{task.sla?.timeRemaining || 0}h</td>
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

export default PendingTasks;