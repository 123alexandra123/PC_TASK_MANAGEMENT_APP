import React from 'react';
import './TaskCard.css';

const TaskCard = ({ task }) => {
    console.log('Task SLA data:', {
      id: task.id,
      deadline: task.sla_deadline,
      status: task.sla?.status,
      timeRemaining: task.sla?.timeRemaining
    });

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