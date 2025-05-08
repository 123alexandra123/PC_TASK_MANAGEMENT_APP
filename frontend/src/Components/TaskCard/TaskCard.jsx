import React from 'react';
import './TaskCard.css';

const TaskCard = ({ task }) => {
  const slaColors = {
    'On Track': '#4caf50',
    'At Risk': '#ff9800',
    'Breached': '#f44336',
    'Completed': '#8bc34a'
  };

  return (
    <div className="task-card">
      <div className="task-header">
        <h3>{task.title}</h3>
        <div className="sla-info">
          <span 
            className="sla-badge" 
            style={{ backgroundColor: slaColors[task.sla.status] }}
          >
            {task.sla.status}
          </span>
          {!task.completed && (
            <span className="time-remaining">
              {task.sla.timeRemaining}h remaining
            </span>
          )}
        </div>
      </div>
      {/* ...existing task content... */}
    </div>
  );
};

export default TaskCard;