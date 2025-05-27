import React, { useState, useEffect } from 'react';
import './EditTaskModal.css';

const EditTaskModal = ({ show, task, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [selectedTeam, setSelectedTeam] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [status, setStatus] = useState('in progress');
    const [teams, setTeams] = useState([]);
    const [users, setUsers] = useState([]);
    const isAdmin = sessionStorage.getItem('is_admin') === '1';
  
    useEffect(() => {
      if (task) {
        setTitle(task.title);
        setDescription(task.description || '');
        setPriority(task.priority);
        setSelectedTeam(task.assigned_to || '');
        setSelectedUser(task.user_id || '');
        setStatus(task.status || 'in progress');
      }
    }, [task]);
  
    useEffect(() => {
      // Fetch teams from backend
      const fetchTeams = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/auth/teams');
          const data = await response.json();
          setTeams(Array.isArray(data) ? data : []);
        } catch (error) {
          setTeams([]);
        }
      };
      fetchTeams();
    }, []);
  
    useEffect(() => {
      // Fetch users for selected team from backend
      if (!selectedTeam) {
        setUsers([]);
        setSelectedUser('');
        return;
      }
      const fetchUsers = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/teams/${selectedTeam}/users`);
          const data = await response.json();
          setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
          setUsers([]);
        }
      };
      fetchUsers();
    }, [selectedTeam]);
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (!title) return;
      onSave({
        ...task,
        title,
        description,
        priority,
        assigned_to: selectedTeam,
        user_id: selectedUser,
        completed: task.completed,
        status,
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
  
              <div className="form-group mb-3">
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="form-select"
                >
                  <option value="">Select Team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
  
              <div className="form-group mb-3">
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="form-select"
                >
                  <option value="">Select User</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
  
              <div className="form-group mb-3">
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="form-select"
                  disabled={!isAdmin && status === 'closed'}
                >
                  <option value="in progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  {/* Optiunea Closed nu mai este afisata */}
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