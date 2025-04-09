import React, { useState } from 'react';
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
        console.log(data);
        localStorage.setItem('token', data.token);
        navigate('/main');
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Eroare la conectare cu serverul');
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
          role: 'user'
        })
      });

      const data = await response.json();
      if (response.ok) {
        alert('Înregistrare reușită!');
        console.log(data);
        setAction('');
      } else {
        alert(data.message || 'Înregistrarea a eșuat');
      }
    } catch (error) {
      console.error('Register error:', error);
      alert('Eroare la conectare cu serverul');
    }
  };

  return (
    <div className="login-page">
      <div className={`wrapper${action}`}>
        <div className="form-box login">
          <form onSubmit={handleLogin}>
            <h1>Login</h1>
            <div className="input-box">
              <input
                type="text"
                placeholder='Email'
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
              <FaUser className='icon' />
            </div>
            <div className="input-box">
              <input
                type="password"
                placeholder='Password'
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              <FaLock className='icon' />
            </div>

            <div className="remember-forgot">
              <label><input type="checkbox" />Remember me</label>
              <a href="#">Forgot password?</a>
            </div>

            <button type="submit">Login</button>

            <div className="register-link">
              <p>Don't have an account? <a href="#" onClick={registerLink}>Register</a></p>
            </div>
          </form>
        </div>

        <div className="form-box register">
          <form onSubmit={handleRegister}>
            <h1>Registration</h1>
            <div className="input-box">
              <input
                type="text"
                placeholder='Username'
                required
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
              />
              <FaUser className='icon' />
            </div>
            <div className="input-box">
              <input
                type="email"
                placeholder='Email'
                required
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
              />
              <FaEnvelope className='icon' />
            </div>
            <div className="input-box">
              <input
                type="password"
                placeholder='Password'
                required
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
              />
              <FaLock className='icon' />
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
