import React, { useEffect, useState } from 'react';
import Navbar from '../Navbar/Navbar';
import AddTaskModal from '../AddTaskModal/AddTaskModal';
import EditTaskModal from '../EditTaskModal/EditTaskModal';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTaskById,
  toggleTaskStatus
} from '../../services/taskService';
import './MainPage.css';

const calculateTimeRemaining = (slaDeadline) => {
  if (!slaDeadline) return 0;
  const now = new Date();
  const deadline = new Date(slaDeadline);
  const diffHours = Math.floor((deadline - now) / (1000 * 60 * 60));
  return Math.max(0, diffHours);
};

const MainPage = () => {
  const [tasks, setTasks] = useState([]);
  const [sortBy, setSortBy] = useState('deadline');
  const [filterPriority, setFilterPriority] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [refresh, setRefresh] = useState(0);

  const tasksPerPage = 5;

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await getTasks(currentPage, tasksPerPage);
        console.log('Received tasks:', data); // Add this debug log
        if (data && data.tasks) {
          setTasks(data.tasks);
          setTotalPages(data.totalPages || 1);
        } else {
          console.error('No tasks data received');
          setTasks([]);
          setTotalPages(1);
        }
      } catch (err) {
        console.error("Failed to load tasks:", err);
        setTasks([]);
        setTotalPages(1);
      }
    };

    loadTasks();
  }, [currentPage, refresh]);

  const handleTaskAdded = () => {
    setRefresh(prev => prev + 1);
  };

  const handleAddTask = async (newTask) => {
    try {
      const created = await createTask({ ...newTask, assigned_to: newTask.selectedTeam });
      handleTaskAdded();
      setShowAddModal(false);
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  };

  const handleEditTask = async (updatedTask) => {
    try {
      await updateTask(updatedTask.id, updatedTask);
      handleTaskAdded();
      setShowEditModal(false);
    } catch (err) {
      console.error("Failed to edit task:", err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTaskById(id);
      handleTaskAdded();
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const handleToggleComplete = async (id) => {
    try {
      await toggleTaskStatus(id);
      handleTaskAdded();
    } catch (err) {
      console.error("Failed to toggle complete:", err);
    }
  };

  const getSLAStatusClass = (task) => {
    if (!task.sla?.status) return '';
    const status = task.sla.status.toLowerCase();
    switch (status) {
      case 'waiting':
        return 'sla-waiting';
      case 'breached':
        return 'sla-breached';
      case 'completed':
        return 'sla-completed';
      default:
        return '';
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === 'deadline') return new Date(a.deadline) - new Date(b.deadline);
    if (sortBy === 'createdAt') return new Date(a.created_at) - new Date(b.created_at);
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
          {filteredTasks.length === 0 ? (
            <p className="text-white">No tasks found for current filter.</p>
          ) : (
            filteredTasks.map(task => (
              <div key={task.id} className="card p-3 mb-3 shadow-sm">
                <div className="d-flex justify-content-between align-items-start">
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
                      {task.sla && (
                        <span className={`sla-badge ${task.completed ? 'sla-completed' : 
                          new Date() > new Date(task.sla_deadline) ? 'sla-breached' : 'sla-waiting'}`}>
                          {task.completed ? 'Completed' : 
                           new Date() > new Date(task.sla_deadline) ? 'Breached' : 'Waiting'}
                        </span>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-white mb-1 ps-4 small">{task.description}</p>
                    )}
                    <div className="d-flex justify-content-between text-muted small">
                      <span>📅 Created: {new Date(task.created_at).toLocaleDateString()}</span>
                      <span>⏳ Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                      <span>⚡ Priority: {task.priority}</span>
                      <span>⏰ SLA: {task.sla?.timeRemaining || 0}h remaining</span>
                    </div>
                  </div>
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
        onTaskAdded={handleTaskAdded}
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