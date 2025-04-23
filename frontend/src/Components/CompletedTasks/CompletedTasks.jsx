import React, { useState } from 'react';
import Navbar from '../Navbar/Navbar';
import './CompletedTasks.css';

const CompletedTasks = ({ tasks, toggleComplete, deleteTask, editTask }) => {
  const completedTasks = tasks.filter(task => task.completed);

  // Paginare
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const paginatedTasks = completedTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(completedTasks.length / tasksPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="main-content container task-list">
        <h2 className="fw-bold text-white mb-4">✅ Completed Tasks</h2>
        {paginatedTasks.length === 0 ? (
          <p className="text-white">No completed tasks yet.</p>
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
                  <h5 className="mb-0 completed-task-title">{task.title}</h5>
                </div>
                <div className="d-flex justify-content-between text-muted small">
                  <span>📅 Created: {task.createdAt}</span>
                  <span>⏳ Deadline: {task.deadline}</span>
                  <span>⚡ Priority: {task.priority}</span>
                </div>
              </div>

              <div className="d-flex mt-3 mt-md-0 ms-md-3 gap-2">
                <button
                  onClick={() =>
                    editTask(task.id,
                      prompt('New title:', task.title),
                      prompt('New deadline:', task.deadline)
                    )
                  }
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

        {/* Paginare */}
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
    </div>
  );
};

export default CompletedTasks;
