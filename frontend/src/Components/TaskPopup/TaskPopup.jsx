import React from 'react';
import * as XLSX from 'xlsx';
import './TaskPopup.css';

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
            <div className="task-list">
              {tasks.map(task => (
                <div key={task.id} className="task-item">
                  <h5>{task.title}</h5>
                  <p className="description">{task.description || 'No description'}</p>
                  <div className="task-meta">
                    <span className={`priority ${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                    <span className="team">{task.team_name || 'Unassigned'}</span>
                    <span className="assigned">{task.assigned_to_name ? `Assigned: ${task.assigned_to_name}` : ''}</span>
                    <span className="date">
                      Created: {new Date(task.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskPopup;