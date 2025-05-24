import React, { useState, useEffect } from 'react';
import './EditTaskModal.css';

const EditTaskModal = ({ show, task, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [selectedTeam, setSelectedTeam] = useState('');
    const [teams, setTeams] = useState([]);
  
    useEffect(() => {
      if (task) {
        setTitle(task.title);
        setDescription(task.description || '');
        setPriority(task.priority);
        setSelectedTeam(task.teamId || '');
      }
    }, [task]);
  
    useEffect(() => {
      // Fetch teams from the server or use a static list
      setTeams([
        { id: '1', name: 'Team Alpha' },
        { id: '2', name: 'Team Beta' },
        { id: '3', name: 'Team Gamma' },
      ]);
    }, []);
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (!title) return;
      onSave({
        ...task,
        title,
        description,
        priority,
        teamId: selectedTeam,
        completed: task.completed, // Include câmpul `completed`
      });
      onClose();
    };
  
    if (!show) return null;
  
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h5>✏️ Edit Task</h5>
            <button className="close-button" onClick={onClose}>&times;</button>
          </div>
  
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title"
                  required
                />
              </div>
  
              <div className="form-group mb-3">
                <textarea
                  className="form-control"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description"
                  rows={3}
                />
              </div>
  
              <div className="form-group mb-3">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="form-select"
                >
                  <option value="Critical">Critical 🔴</option>
                  <option value="High">High 🟠</option>
                  <option value="Medium">Medium 🟡</option>
                  <option value="Low">Low 🟢</option>
                </select>
              </div>
  
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };
  
  export default EditTaskModal;