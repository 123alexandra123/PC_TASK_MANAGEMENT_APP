import React, { useEffect, useState } from 'react';
import Navbar from '../Navbar/Navbar';
import AddTaskModal from '../AddTaskModal/AddTaskModal';
import EditTaskModal from '../EditTaskModal/EditTaskModal';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTaskById,
  toggleTaskStatus // Asigură-te că importi această funcție corect
} from '../../services/taskService';
import './MainPage.css';

const MainPage = () => {
  const [tasks, setTasks] = useState([]);
  const [sortBy, setSortBy] = useState('deadline');
  const [filterPriority, setFilterPriority] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const tasksPerPage = 5;

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    }
  };

  const handleAddTask = async (newTask) => {
    try {
      const created = await createTask(newTask);
      await loadTasks(); // reîncarcă lista
      setShowAddModal(false);
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  };

  const handleEditTask = async (updatedTask) => {
    try {
      await updateTask(updatedTask.id, updatedTask);
      await loadTasks(); // reîncarcă lista
      setShowEditModal(false);
    } catch (err) {
      console.error("Failed to edit task:", err);
    }
  };

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

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === 'deadline') return new Date(a.deadline) - new Date(b.deadline);
    if (sortBy === 'createdAt') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'priority') {
      const order = { High: 1, Medium: 2, Low: 3 };
      return order[a.priority] - order[b.priority];
    }
    return 0;
  });

  const filteredTasks = filterPriority === 'all'
    ? sortedTasks
    : sortedTasks.filter(task => task.priority === filterPriority);

  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const paginatedTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="main-content container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <h2 className="fw-bold text-white">📝 All Tasks</h2>
          <button onClick={() => setShowAddModal(true)} className="btn btn-success px-4">
            + Add Task
          </button>
        </div>

        <div className="d-flex gap-3 mb-4 flex-wrap">
          <select className="form-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="deadline">Sort by deadline</option>
            <option value="createdAt">Sort by creation date</option>
            <option value="priority">Sort by priority</option>
            <option value="title">Sort alphabetically</option>
          </select>
          <select className="form-select" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
            <option value="all">All priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="task-list">
          {paginatedTasks.length === 0 ? (
            <p className="text-white">No tasks found for current filter.</p>
          ) : (
            paginatedTasks.map(task => (
              <div key={task.id} className="card p-3 mb-3 shadow-sm d-flex flex-column flex-md-row justify-content-between align-items-center">
                <div className="w-100">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={task.completed}
                      onChange={() => handleToggleComplete(task.id)}
                    />
                    <h5 className={`mb-0 ${task.completed ? 'completed-task-title' : ''}`}>
                      {task.title}
                    </h5>
                  </div>
                  {task.description && (
                    <p className="text-white mb-1 ps-4 small">{task.description}</p>
                  )}
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
                  <button onClick={() => handleDeleteTask(task.id)} className="btn btn-outline-danger btn-sm">
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
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

      <AddTaskModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddTask}
      />

      <EditTaskModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEditTask}
        task={selectedTask}
      />
    </div>
  );
};

export default MainPage;
