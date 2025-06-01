// pt upload imagine de profil
export const uploadProfileImage = async (userId, file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`http://localhost:5000/api/upload/profile-image/${userId}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload image');
  }

  return await response.json(); // returnează { imageUrl: '/uploads/...png' }
};

// pt stergerea imaginii de profil
export const deleteProfileImage = async (userId) => {
  const response = await fetch(`http://localhost:5000/api/upload/profile-image/${userId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete image');
  }

  return await response.json(); // { imageUrl: '/uploads/default-avatar.png' }
};
