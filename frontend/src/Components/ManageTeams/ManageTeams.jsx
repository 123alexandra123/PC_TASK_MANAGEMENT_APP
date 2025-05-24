import React, { useEffect, useState } from 'react';
import Navbar from '../Navbar/Navbar';
import './ManageTeams.css';

const ManageTeams = () => {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState({});
  const [teamDescriptions, setTeamDescriptions] = useState({});
  const [activeDescription, setActiveDescription] = useState(null);
  const [search, setSearch] = useState('');
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [showEditTeamModal, setShowEditTeamModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [editTeamName, setEditTeamName] = useState('');
  const [editTeamDescription, setEditTeamDescription] = useState('');
  const [originalTeamName, setOriginalTeamName] = useState('');

  useEffect(() => {
    fetchUsersAndTeams();
  }, []);

  const fetchUsersAndTeams = async () => {
    try {
      const usersRes = await fetch('http://localhost:5000/api/auth/users');
      const usersData = await usersRes.json();
      setUsers(usersData);

      const teamsRes = await fetch('http://localhost:5000/api/teams');
      const teamsData = await teamsRes.json();
      const descriptions = {};
      const grouped = {};

      teamsData.forEach(team => {
        descriptions[team.name] = team.description;
        grouped[team.name] = [];
      });

      usersData.forEach(user => {
        const group = user.group || 'No Team';
        if (!grouped[group]) grouped[group] = [];
        grouped[group].push(user);
      });

      setTeamDescriptions(descriptions);
      setTeams(grouped);
    } catch (err) {
      console.error('Failed to fetch users or teams:', err);
    }
  };

  const handleTeamChange = async (userId, newTeam) => {
    const updatedUsers = users.map(user =>
      user.id === userId ? { ...user, group: newTeam === 'No Team' ? null : newTeam } : user
    );
    setUsers(updatedUsers);

    const updatedTeams = { ...teams };
    Object.keys(updatedTeams).forEach(team => {
      updatedTeams[team] = updatedTeams[team].filter(user => user.id !== userId);
    });
    const updatedUser = updatedUsers.find(user => user.id === userId);
    const targetTeam = updatedUser.group || 'No Team';
    if (!updatedTeams[targetTeam]) updatedTeams[targetTeam] = [];
    updatedTeams[targetTeam].push(updatedUser);
    setTeams(updatedTeams);

    try {
      await fetch(`http://localhost:5000/api/auth/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group: newTeam === 'No Team' ? null : newTeam })
      });
    } catch (error) {
      console.error('Failed to update user team:', error);
    }
  };

  const handleAddTeam = async () => {
    if (!newTeamName.trim() || !newTeamDescription.trim()) return;

    try {
      const res = await fetch('http://localhost:5000/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTeamName, description: newTeamDescription })
      });

      if (res.ok) {
        setShowAddTeamModal(false);
        setNewTeamName('');
        setNewTeamDescription('');
        fetchUsersAndTeams();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to add team');
      }
    } catch (error) {
      console.error('Error adding team:', error);
    }
  };

  const handleEditTeam = async () => {
    if (!editTeamName.trim() || !editTeamDescription.trim()) return;

    try {
      const res = await fetch(`http://localhost:5000/api/teams/${originalTeamName}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editTeamName, description: editTeamDescription })
      });

      if (res.ok) {
        setShowEditTeamModal(false);
        setEditTeamName('');
        setEditTeamDescription('');
        setOriginalTeamName('');
        fetchUsersAndTeams();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update team');
      }
    } catch (error) {
      console.error('Error editing team:', error);
    }
  };

  const handleDeleteTeam = async (teamName) => {
    if (!window.confirm(`Are you sure you want to delete team "${teamName}"?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/teams/${teamName}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchUsersAndTeams();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete team');
      }
    } catch (err) {
      console.error('Error deleting team:', err);
      alert('Something went wrong while deleting the team.');
    }
  };

  const uniqueTeams = Object.keys(teamDescriptions);
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Navbar />
      <div className="main-content container text-white">
        <h2 className="fw-bold mb-4 d-flex justify-content-between align-items-center">
          <span>👥 Manage Teams</span>
          <button className="btn btn-primary purple-button" onClick={() => {
            setNewTeamName('');
            setNewTeamDescription('');
            setShowAddTeamModal(true);
          }}>
            ➕ Add Team
          </button>
        </h2>

        <div className="mb-4">
          <input
            type="text"
            className="form-control bg-dark text-white border-secondary"
            placeholder="🔍 Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="row">
          <div className="col-md-6">
            <h4 className="mb-3">All Users</h4>
            <div className="user-list bg-dark p-3 rounded">
              {filteredUsers.map(user => (
                <div key={user.id} className="user-item d-flex justify-content-between align-items-center mb-2 p-3 rounded">
                  <div>
                    <div className="fw-bold">{user.name}</div>
                    <div className="text-muted small">{user.email}</div>
                  </div>
                  <select
                    className="form-select w-auto bg-dark text-white"
                    value={user.group || 'No Team'}
                    onChange={(e) => handleTeamChange(user.id, e.target.value)}
                  >
                    {uniqueTeams.map(team => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="col-md-6">
            <h4 className="mb-3">Teams Overview</h4>
            <div className="teams-overview bg-dark p-3 rounded">
              {Object.entries(teams).map(([team, members]) => (
                <div key={team} className="mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6
                      className="text-info team-name-clickable"
                      onClick={() => {
                        const desc = teamDescriptions[team] || 'No description available.';
                        setActiveDescription(desc);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {team}
                    </h6>
                    <div>
                      <button
                        className="btn btn-sm btn-warning me-2"
                        style={{ border: '1px solid #0d6efd', color: '#0d6efd', backgroundColor: 'transparent' }}
                        onClick={() => {
                          setEditTeamName(team);
                          setEditTeamDescription(teamDescriptions[team]);
                          setOriginalTeamName(team);
                          setShowEditTeamModal(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        style={{ border: '1px solid #dc3545', color: '#dc3545', backgroundColor: 'transparent' }}
                        onClick={() => handleDeleteTeam(team)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <span className="badge bg-secondary">
                    👥 {members.length} {members.length === 1 ? 'member' : 'members'}
                  </span>
                  {members.length > 0 ? (
                    <ul className="list-unstyled">
                      {members.map(member => (
                        <li key={member.id}>• {member.name}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted small ms-3">No members in this team.</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {activeDescription && (
          <div className="modal-backdrop" onClick={() => setActiveDescription(null)}>
            <div className="modal-content-custom" onClick={(e) => e.stopPropagation()}>
              <p>{activeDescription}</p>
              <button className="btn btn-secondary mt-3" onClick={() => setActiveDescription(null)}>
                Close
              </button>
            </div>
          </div>
        )}

        {showAddTeamModal && (
          <div className="modal-backdrop" onClick={() => setShowAddTeamModal(false)}>
            <div className="modal-content-custom" style={{ width: '500px', maxWidth: '90%' }} onClick={(e) => e.stopPropagation()}>
              <h5 className="mb-3">Add New Team</h5>
              <input
                type="text"
                className="form-control mb-2 text-white bg-dark"
                placeholder="Team name"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
              />
              <textarea
                className="form-control mb-3 text-white bg-dark"
                placeholder="Team description"
                value={newTeamDescription}
                onChange={(e) => setNewTeamDescription(e.target.value)}
              />
              <button className="btn btn-primary purple-button me-2" onClick={handleAddTeam}>Save</button>
              <button className="btn btn-secondary" onClick={() => setShowAddTeamModal(false)}>Cancel</button>
            </div>
          </div>
        )}

        {showEditTeamModal && (
          <div className="modal-backdrop" onClick={() => {
            setShowEditTeamModal(false);
            setEditTeamName('');
            setEditTeamDescription('');
            setOriginalTeamName('');
          }}>
            <div className="modal-content-custom" style={{ width: '500px', maxWidth: '90%' }} onClick={(e) => e.stopPropagation()}>
              <h5 className="mb-3">Edit Team</h5>
              <input
                type="text"
                className="form-control mb-2 text-white bg-dark"
                placeholder="Team name"
                value={editTeamName}
                onChange={(e) => setEditTeamName(e.target.value)}
              />
              <textarea
                className="form-control mb-3 text-white bg-dark"
                placeholder="Team description"
                value={editTeamDescription}
                onChange={(e) => setEditTeamDescription(e.target.value)}
              />
              <button className="btn btn-primary purple-button me-2" onClick={handleEditTeam}>Save</button>
              <button className="btn btn-secondary" onClick={() => {
                setShowEditTeamModal(false);
                setEditTeamName('');
                setEditTeamDescription('');
                setOriginalTeamName('');
              }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageTeams;
