import React, { useState, useEffect } from 'react';
import './AddTaskModal.css';

const AddTaskModal = ({ show, onClose, onTaskAdded }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium'); // Default priority
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');

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

  useEffect(() => {
    if (!selectedTeam) {
      setUsers([]);
      setSelectedUser('');
      return;
    }
    const fetchUsers = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/teams/${selectedTeam}/users`);
        const data = await response.json();
        setUsers(data);
        setSelectedUser('');
      } catch (error) {
        setUsers([]);
        setSelectedUser('');
      }
    };
    fetchUsers();
  }, [selectedTeam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !selectedTeam || !selectedUser) {
      return alert('Title, team and user selection are required!');
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
          priority,
          assigned_to: selectedTeam, // team ID
          user_id: selectedUser      // user ID
        })
      });

      if (response.ok) {
        setTitle('');
        setDescription('');
        setPriority('Medium');
        setSelectedTeam('');
        setSelectedUser('');
        // Call the parent's onTaskAdded callback
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
          {selectedTeam && (
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="form-select"
              required
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          )}
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