const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { updateProfileImage, findUserById } = require('../models/User');


router.get('/test', (req, res) => {
  res.send('🔧 /api/upload/test merge!');
});


// Configurare stocare fișiere
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage });

// 🔼 Upload imagine profil
router.post('/profile-image/:userId', upload.single('image'), async (req, res) => {
  const userId = req.params.userId;

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const imageUrl = `/uploads/${req.file.filename}`;

  try {
    await updateProfileImage(userId, imageUrl);
    res.status(200).json({ imageUrl });
  } catch (err) {
    console.error('Error saving image to DB:', err);
    res.status(500).json({ error: 'Failed to save image' });
  }
});

// ❌ Șterge imaginea și setează default-avatar
router.delete('/profile-image/:userId', async (req, res) => {
    console.log("DELETE request for userId:", req.params.userId); // 👈
  const userId = req.params.userId;
  const defaultUrl = '/uploads/default-avatar.png';

  try {
    const user = await findUserById(userId);
    const currentImage = user?.profile_image;

    // Șterge doar dacă nu e default și fișierul există
    if (currentImage && currentImage !== defaultUrl) {
      const filePath = path.join(__dirname, '..', currentImage);
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error('Error deleting old image:', err);
          }
        });
      }
    }

    await updateProfileImage(userId, defaultUrl);
    res.status(200).json({ imageUrl: defaultUrl });
  } catch (err) {
    console.error('Failed to reset image:', err);
    res.status(500).json({ error: 'Could not reset image' });
  }
});

module.exports = router;
