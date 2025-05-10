import React, { useState, useEffect } from 'react';
import './AddTaskModal.css';

const AddTaskModal = ({ show, onClose, onTaskAdded }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/teams');
        const data = await response.json();
        setTeams(data);
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };

    fetchTeams();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !deadline || !selectedTeam) {
      return alert('Title, deadline, and team selection are required!');
    }

    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          deadline,
          priority,
          assigned_to: selectedTeam
        })
      });

      if (response.ok) {
        setTitle('');
        setDescription('');
        setDeadline('');
        setPriority('Medium');
        setSelectedTeam('');
        onTaskAdded && onTaskAdded();
        onClose();
      } else {
        const data = await response.json();
        alert('Failed to create task: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Failed to create task: ' + error.message);
    }
  };

  const calculateSLADeadline = (priority) => {
    const now = new Date();
    switch (priority) {
      case 'High':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
      case 'Medium':
        return new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString();
      case 'Low':
        return new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString();
    }
  };

  if (!show) return null;

  return (
    <div className={`modal-overlay ${show ? 'show' : ''}`}>
      <div className="modal-content">
        <h4 className="mb-3">➕ Add New Task</h4>
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="form-control"
          />
          <textarea
            placeholder="Task description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="form-control"
          />
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
            className="form-control"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="form-select"
          >
            <option value="High">High 🔴</option>
            <option value="Medium">Medium 🟠</option>
            <option value="Low">Low 🟢</option>
          </select>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="form-select"
            required
          >
            <option value="">Select Team</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>

          <div className="d-flex justify-content-end gap-2 mt-3">
            <button type="button" className="btn btn-outline-light" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-success">
              Save Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;