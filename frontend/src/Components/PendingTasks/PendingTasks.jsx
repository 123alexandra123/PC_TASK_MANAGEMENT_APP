import React, { useState } from 'react';
import Navbar from '../Navbar/Navbar';
import EditTaskModal from '../EditTaskModal/EditTaskModal';
import './PendingTasks.css';

const PendingTasks = ({ tasks, toggleComplete, deleteTask, editTask }) => {
  const pendingTasks = tasks.filter(task => !task.completed);

  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;

  const [selectedTask, setSelectedTask] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const paginatedTasks = pendingTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(pendingTasks.length / tasksPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="main-content container task-list">
        <h2 className="fw-bold text-white mb-4">🕒 Pending Tasks</h2>

        {paginatedTasks.length === 0 ? (
          <p className="text-white">No pending tasks. All done! 🎉</p>
        ) : (
          paginatedTasks.map(task => (
            <div key={task.id} className="card p-3 mb-3 shadow-sm d-flex flex-column flex-md-row justify-content-between align-items-center">
              <div className="w-100">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={task.completed}
                    onChange={() => toggleComplete(task.id)}
                  />
                  <div>
                    <h5 className="mb-1">{task.title}</h5>
                    <p className="text-white mb-0 small">
                      {task.description || <i>No description provided</i>}
                    </p>
                  </div>
                </div>
                <div className="d-flex justify-content-between text-muted small">
                  <span>📅 Created: {task.createdAt}</span>
                  <span>⏳ Deadline: {task.deadline}</span>
                  <span>⚡ Priority: {task.priority}</span>
                </div>
              </div>

              <div className="d-flex mt-3 mt-md-0 ms-md-3 gap-2">
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
                  onClick={() => deleteTask(task.id)}
                  className="btn btn-outline-danger btn-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}

        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-4 gap-2">
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ⬅ Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
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

      {/* Modal Edit Task */}
      <EditTaskModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={(updatedTask) => {
          editTask(updatedTask.id, updatedTask.title, updatedTask.deadline);
          setShowEditModal(false);
        }}
        task={selectedTask}
      />
    </div>
  );
};

export default PendingTasks;
