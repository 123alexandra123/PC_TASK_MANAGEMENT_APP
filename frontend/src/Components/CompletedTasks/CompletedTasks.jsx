import React, { useEffect, useState } from 'react';
import Navbar from '../Navbar/Navbar';
import { getTasks, deleteTaskById, toggleTaskStatus } from '../../services/taskService'; // Importăm funcțiile pentru a obține și șterge task-urile
import './CompletedTasks.css';

const CompletedTasks = () => {
  // Asigurăm inițializarea corectă a stării `tasksState` ca array
  const [tasksState, setTasksState] = useState([]); // Stocăm task-urile completate

  // Paginare
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const tasksPerPage = 5;

  // Încarcă task-urile completate de la backend
  useEffect(() => {
    loadTasks();
  }, [currentPage]);

  // Pass the `filter` parameter as 'completed' when fetching tasks
  const loadTasks = async () => {
    try {
      const data = await getTasks(currentPage, tasksPerPage, 'completed'); // Fetch only completed tasks
      setTasksState(data.tasks || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTaskById(id); // Ștergem task-ul de la backend
      await loadTasks(); // Reîncarcă lista de task-uri după ștergere
    } catch (err) {
      console.error("Failed to delete task:", err); // Dacă se întâmplă o eroare la ștergere
    }
  };

  const handleToggleComplete = async (id) => {
    try {
      await toggleTaskStatus(id); // Schimbăm statusul unui task la backend
      await loadTasks(); // Reîncarcă lista după ce s-a schimbat statusul task-ului
    } catch (err) {
      console.error("Failed to toggle complete:", err); // Dacă se întâmplă o eroare
    }
  };

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
        {tasksState.length === 0 ? (
          <p className="text-white">No completed tasks yet.</p>
        ) : (
          tasksState.map(task => (
            <div key={task.id} className="card p-3 mb-3 shadow-sm d-flex flex-column flex-md-row justify-content-between align-items-center">
              <div className="w-100">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={task.completed}
                    onChange={() => handleToggleComplete(task.id)} // Schimbăm statusul unui task la backend
                  />
                  <div>
                    <h5 className="mb-1 completed-task-title">{task.title}</h5>
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
                  onClick={() => handleDeleteTask(task.id)} // Ștergem task-ul
                  className="btn btn-outline-danger btn-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}

        {/* Pagination */}
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
