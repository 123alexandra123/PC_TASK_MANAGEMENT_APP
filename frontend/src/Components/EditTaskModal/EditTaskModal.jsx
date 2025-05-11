import React, { useState, useEffect } from 'react';
import './EditTaskModal.css';

const EditTaskModal = ({ show, onClose, onSave, task }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
  
    useEffect(() => {
      if (task) {
        setTitle(task.title);
        setDescription(task.description || '');
        setPriority(task.priority);
      }
    }, [task]);
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (!title) return;
      onSave({
        ...task,
        title,
        description,
        priority,
        completed: task.completed, // Include câmpul `completed`
      });
      onClose();
    };
  
    if (!show) return null;
  
    return (
      <div className="edit-modal-overlay">
        <div className="edit-modal-content">
          <h4>Edit Task</h4>
          <form onSubmit={handleSubmit} className="edit-task-form">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
  
            <div className="edit-modal-buttons">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-success">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  export default EditTaskModal;