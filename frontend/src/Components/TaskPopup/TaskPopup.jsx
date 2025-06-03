import React from 'react';
import * as XLSX from 'xlsx';
import './TaskPopup.css';

//componenta pt popup-ul de task-uri la chart uri 
const TaskPopup = ({ show, onClose, tasks, title, popupType }) => {
  if (!show) return null;

  const handleExport = () => {
    let data;
    if (popupType === 'users') {
      data = tasks.map(user => ({
        Name: user.name,
        Email: user.email,
        Team: user.group
      }));
    } else {
      data = tasks.map(task => ({
        Title: task.title,
        Description: task.description || '',
        Priority: task.priority,
        Team: task.team_name || '',
        AssignedTo: task.assigned_to_name || '',
        Status: task.completed ? 'Completed' : 'Pending',
        Created: new Date(task.created_at).toLocaleDateString(),
        Deadline: task.sla_deadline ? new Date(task.sla_deadline).toLocaleDateString() : ''
      }));
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, popupType === 'users' ? 'Users' : 'Tasks');
    const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={e => e.stopPropagation()}>
        <div className="popup-header">
          <div className="d-flex justify-content-between align-items-center w-100">
            <h4>{title}</h4>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-success btn-sm"
                onClick={handleExport}
                title="Export to Excel"
              >
                Export ⬇️
              </button>
              <button 
                className="close-button" 
                onClick={onClose}
                title="Close"
              >
                &times;
              </button>
            </div>
          </div>
        </div>
        <div className="popup-body">
          {tasks.length === 0 ? (
            <p className="text-muted">{popupType === 'users' ? 'No users found' : 'No tasks found'}</p>
          ) : popupType === 'users' ? (
            <div className="user-list">
              {tasks.map(user => (
                <div key={user.id} className="user-item">
                  <strong>{user.name}</strong>
                  <div>Email: {user.email}</div>
                  <div>Team: {user.group}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="task-table-wrapper">
              <div className="table-responsive">
                <table className="table table-dark table-bordered table-hover align-middle text-white">
                  <thead>
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
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map(task => (
                      <tr key={task.id}>
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={task.completed}
                            disabled
                          />
                        </td>
                        <td>
                          <div className={`fw-bold ${task.completed ? 'completed-task-title' : ''}`}>
                            {task.title}
                          </div>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskPopup;