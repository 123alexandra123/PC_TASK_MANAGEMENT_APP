import React from 'react';
import './TaskPopup.css';

const TaskPopup = ({ show, onClose, tasks, title }) => {
  if (!show) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={e => e.stopPropagation()}>
        <div className="popup-header">
          <h4>{title}</h4>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="popup-body">
          {tasks.length === 0 ? (
            <p className="text-muted">No tasks found</p>
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
                    <span className="team">{task.team_name}</span>
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