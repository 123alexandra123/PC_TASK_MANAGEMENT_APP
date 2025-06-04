import React, { useEffect, useRef, useState, useCallback } from 'react';
import Navbar from '../Navbar/Navbar';
import AddTaskModal from '../AddTaskModal/AddTaskModal';
import EditTaskModal from '../EditTaskModal/EditTaskModal';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTaskById
} from '../../services/taskService';
import './MainPage.css';

const MainPage = () => {
  const [tasks, setTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const tasksPerPage = 20;
  const tableContainerRef = useRef(null);
  const isAdmin = sessionStorage.getItem('is_admin') === '1';

  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks?page=${currentPage}&limit=${tasksPerPage}`);
      const data = await response.json();
      if (Array.isArray(data.tasks)) {
        setTasks(data.tasks);
        setTotalPages(data.totalPages);
      } else {
        console.error('Received invalid tasks data:', data);
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleTaskAdded = async () => {
    await fetchTasks();
  };

  const handleAddTask = async (newTask) => {
    try {
      await createTask({ ...newTask, assigned_to: newTask.selectedTeam });
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

  const handleDeleteTask = async (taskId) => {
    const confirmed = window.confirm("Are you sure you want to delete this task?");
    if (!confirmed) return;

    try {
      await deleteTaskById(taskId);
      const isLastTaskOnPage = tasks.length === 1;
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
      handleTaskAdded();
    } catch (err) {
      console.error("Failed to close task:", err);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      if (tableContainerRef.current) {
        tableContainerRef.current.scrollTop = 0;
      }
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
          <h2 className="fw-bold text-white">📝 All Tasks</h2>
          <button onClick={() => setShowAddModal(true)} className="btn btn-success px-4">
            + Add Task
          </button>
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
                  <th>Resolved At</th>
                  <th>Updated At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="text-center text-white">No tasks found for current filter.</td>
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
                      <td className="small-date">
                        {task.created_at ? (
                          <>
                            {new Date(task.created_at).toLocaleDateString('ro-RO')}
                            <br />
                            <span style={{ fontSize: '0.85em', color: '#aaa' }}>
                              {new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </>
                        ) : '-'}
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
                      <td className="small-date">
                        {task.resolved_at ? (
                          <>
                            {new Date(task.resolved_at).toLocaleDateString('ro-RO')}
                            <br />
                            <span style={{ fontSize: '0.85em', color: '#aaa' }}>
                              {new Date(task.resolved_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </>
                        ) : '-'}
                      </td>
                      <td className="small-date">
                        {task.updated_at ? (
                          <>
                            {new Date(task.updated_at).toLocaleDateString('ro-RO')}
                            <br />
                            <span style={{ fontSize: '0.85em', color: '#aaa' }}>
                              {new Date(task.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </>
                        ) : '-'}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedTask(task);
                              setShowEditModal(true);
                            }}
                            className="icon-btn edit"
                            title="Edit Task"
                          >
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="#6c63ff" strokeWidth="2" d="M16.5 3.5l4 4-12 12H4.5v-4z"/><path stroke="#6c63ff" strokeWidth="2" d="M15 5l4 4"/></svg>
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="icon-btn delete"
                            title="Delete Task"
                          >
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="#f44336" strokeWidth="2" d="M6 7h12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7h12z"/></svg>
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
