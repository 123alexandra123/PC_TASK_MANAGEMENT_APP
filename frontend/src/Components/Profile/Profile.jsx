import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../Navbar/Navbar';
import './Profile.css';
import defaultAvatar from '../Assets/default-avatar.png';

const Profile = () => {
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);
  const [user, setUser] = useState({ username: '', email: '' });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleImageClick = () => fileInputRef.current.click();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div>
      <Navbar />
      <div className="main-content container text-white">
        <h2 className="fw-bold mb-4">👤 User Profile</h2>
        <div className="profile-card p-4">
          <div className="d-flex flex-column align-items-start gap-3">
            <img
              src={profileImage || defaultAvatar}
              alt="Profile"
              className="profile-picture"
              onClick={handleImageClick}
              title="Click to change profile image"
            />
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <button className="btn btn-danger logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
