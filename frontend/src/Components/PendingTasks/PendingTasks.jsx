import React, { useEffect, useState } from 'react';
import Navbar from '../Navbar/Navbar';
import EditTaskModal from '../EditTaskModal/EditTaskModal';
import { getTasks, deleteTaskById, toggleTaskStatus } from '../../services/taskService'; // Importăm funcțiile pentru a obține și șterge task-urile
import './PendingTasks.css';

const PendingTasks = ({ deleteTask, editTask }) => {
  const [tasksState, setTasksState] = useState([]); // Stocăm task-urile nefinalizate

  // Paginare
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;

  // Modal și task selectat pentru editare
  const [selectedTask, setSelectedTask] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Încarcă task-urile pendente de la backend
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await getTasks(); // Obținem task-urile de la backend
      const pendingTasks = data.filter(task => !task.completed); // Filtrăm doar task-urile nefinalizate
      setTasksState(pendingTasks);
    } catch (err) {
      console.error("Failed to load tasks:", err); // Dacă se întâmplă o eroare
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

  const handleEditTask = async (updatedTask) => {
    try {
      await editTask(updatedTask.id, updatedTask); // Actualizăm task-ul la backend
      setShowEditModal(false); // Închidem modalul după actualizare
      await loadTasks(); // Reîncarcă lista de task-uri
    } catch (err) {
      console.error("Failed to edit task:", err); // Dacă se întâmplă o eroare
    }
  };

  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const paginatedTasks = tasksState.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(tasksState.length / tasksPerPage);

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
                    onChange={() => handleToggleComplete(task.id)} // Toggle complete pe frontend
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

      {/* Modal Edit Task */}
      <EditTaskModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={(updatedTask) => {
          handleEditTask(updatedTask);
        }}
        task={selectedTask}
      />
    </div>
  );
};

export default PendingTasks;
