import React, { useState, useEffect } from 'react';
import './LoginRegister.css';
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const LoginRegister = () => {
  const [action, setAction] = useState('');
  const navigate = useNavigate();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/teams');
        if (!response.ok) throw new Error('Failed to fetch teams');
        const data = await response.json();
        setTeams(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching teams:', error);
        setTeams([]);
      }
    };

    fetchTeams();
  }, []);

  const registerLink = () => setAction(' active');
  const loginLink = () => setAction('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('user', JSON.stringify({
          id: data.user.id,
          name: data.user.name, // ✅ corect
          email: data.user.email,
          group: data.user.group,
          imageUrl: data.user.imageUrl || '/uploads/default-avatar.png'
        }));
        navigate('/main');
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Server error while logging in');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          password: registerPassword,
          role: 'user',
          group: selectedTeam
        })
      });

      const data = await response.json();
      if (response.ok) {
        alert('Registration successful!');
        setAction('');
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Register error:', error);
      alert('Server error while registering');
    }
  };

  return (
    <div className="login-page">
      <div className={`wrapper${action}`}>
        {/* Login Form */}
        <div className="form-box login">
          <form onSubmit={handleLogin}>
            <h1>Login</h1>
            <div className="input-box">
              <input
                type="text"
                placeholder="Email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
              <FaUser className="icon" />
            </div>
            <div className="input-box">
              <input
                type="password"
                placeholder="Password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              <FaLock className="icon" />
            </div>
            <div className="remember-forgot">
              <label><input type="checkbox" /> Remember me</label>
              <a href="#">Forgot password?</a>
            </div>
            <button type="submit">Login</button>
            <div className="register-link">
              <p>Don't have an account? <a href="#" onClick={registerLink}>Register</a></p>
            </div>
          </form>
        </div>

        {/* Register Form */}
        <div className="form-box register">
          <form onSubmit={handleRegister}>
            <h1>Register</h1>
            <div className="input-box">
              <input
                type="text"
                placeholder="Username"
                required
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
              />
              <FaUser className="icon" />
            </div>
            <div className="input-box">
              <input
                type="email"
                placeholder="Email"
                required
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
              />
              <FaEnvelope className="icon" />
            </div>
            <div className="input-box">
              <input
                type="password"
                placeholder="Password"
                required
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
              />
              <FaLock className="icon" />
            </div>
            <div className="input-box">
              <select
                required
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
              >
                <option value="">Select Team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.name}>{team.name}</option>
                ))}
              </select>
            </div>
            <button type="submit">Register</button>
            <div className="register-link">
              <p>Already have an account? <a href="#" onClick={loginLink}>Login</a></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
