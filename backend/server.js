const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files from the project root (where index.html, admin.html are)
app.use(express.static(path.join(__dirname, '..')));

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set up multer for file storage
const storage = multer.memoryStorage(); // Vercel uchun fayllarni xotirada saqlash

const upload = multer({ storage: storage });

// File upload endpoint
app.post('/upload', upload.array('files'), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No files uploaded.');
    }
    const fileUrls = req.files.map(file => {
        // Vercel'da fayllarni to'g'ridan-to'g'ri diskka saqlab bo'lmaydi.
        // Hozircha admin panelini ishga tushirish uchun vaqtinchalik URL'larni qaytaramiz.
        // Haqiqiy saqlash uchun bulutli xizmatlardan foydalanish kerak (masalan, AWS S3, Cloudinary).
        const originalname = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_'); // Fayl nomini tozalash
        return `/dummy-uploads/${Date.now()}-${originalname}`;
    });
    res.json({ urls: fileUrls });
});

module.exports = app;