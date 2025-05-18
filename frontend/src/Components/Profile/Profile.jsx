import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../Navbar/Navbar';
import { uploadProfileImage, deleteProfileImage } from '../../services/userService';
import './Profile.css';
import defaultAvatar from '../Assets/default-avatar.png';

const Profile = () => {
  const [profileImage, setProfileImage] = useState(defaultAvatar);
  const fileInputRef = useRef(null);
  const [user, setUser] = useState({
    id: '',
    name: '',
    email: '',
    group: '',
    imageUrl: '/uploads/default-avatar.png',
  });

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    if (storedUser) {
      const updatedUser = {
        id: storedUser.id,
        name: storedUser.name,
        email: storedUser.email,
        group: storedUser.group,
        imageUrl: storedUser.imageUrl || '/uploads/default-avatar.png',
      };
      setUser(updatedUser);
      setProfileImage(`http://localhost:5000${updatedUser.imageUrl}`);
    }
  }, []);

  const isDefaultImage = !user.imageUrl || user.imageUrl === '/uploads/default-avatar.png';

  const handleImageClick = () => fileInputRef.current.click();

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      try {
        const reader = new FileReader();
        reader.onloadend = () => setProfileImage(reader.result);
        reader.readAsDataURL(file);

        const result = await uploadProfileImage(user.id, file);
        const updatedUser = { ...user, imageUrl: result.imageUrl };
        setUser(updatedUser);
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        setProfileImage(`http://localhost:5000${result.imageUrl}`);
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }
  };

  const handleDeleteImage = async () => {
    if (!window.confirm('Are you sure you want to delete your profile photo?')) return;

    try {
      const result = await deleteProfileImage(user.id);
      const updatedUser = { ...user, imageUrl: result.imageUrl };
      setUser(updatedUser);
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      setProfileImage(`http://localhost:5000${result.imageUrl}`);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    window.location.href = '/login';
  };

  const handleImgError = () => {
    setProfileImage(defaultAvatar);
  };

  return (
    <div>
      <Navbar />
      <div className="main-content container text-white">
        <h2 className="fw-bold mb-4">👤 User Profile</h2>
        <div className="profile-card p-4">
          <div className="d-flex flex-column align-items-start gap-3">
            <img
              src={profileImage}
              alt="Profile"
              className="profile-picture"
              onClick={handleImageClick}
              onError={handleImgError}
              title="Click to change profile image"
            />
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <p><strong>Username:</strong> {user.name}</p>
            <p><strong>Group:</strong> {user.group || 'No group assigned'}</p>
            <p><strong>Email:</strong> {user.email}</p>

            <div className="d-flex gap-2">
              <button className="btn btn-danger logout-btn" onClick={handleLogout}>
                Logout
              </button>
              <button
                className="btn btn-outline-warning"
                onClick={handleDeleteImage}
                disabled={isDefaultImage}
                title={isDefaultImage ? 'Already using default photo' : 'Delete current photo'}
              >
                🗑 Delete Photo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
