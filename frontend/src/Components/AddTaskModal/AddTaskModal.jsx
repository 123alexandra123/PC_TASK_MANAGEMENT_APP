import React, { useState, useEffect } from 'react';
import './AddTaskModal.css';

const AddTaskModal = ({ show, onClose, onSave }) => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !deadline || !selectedTeam) return alert('Title, deadline, and team selection are required!');
    onSave({ title, description, deadline, priority, selectedTeam });
    onClose(); // închide modalul după salvare
    setTitle('');
    setDescription('');
    setDeadline('');
    setPriority('Medium');
    setSelectedTeam('');
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
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
              <option key={team.id} value={team.name}>{team.name}</option>
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
