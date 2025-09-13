require('dotenv').config({ path: path.join(__dirname, '.env') }); // .env faylini yuklash
const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const cloudinary = require('cloudinary').v2; // Cloudinary SDK ni import qilish

const app = express();
const PORT = process.env.PORT || 3000;

// Cloudinary konfiguratsiyasi
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
app.post('/upload', upload.array('files'), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No files uploaded.');
    }

    try {
        const uploadedUrls = [];
        for (const file of req.files) {
            // Faylni base64 formatiga o'tkazamiz
            const b64 = Buffer.from(file.buffer).toString("base64");
            let dataURI = "data:" + file.mimetype + ";base64," + b64;
            const result = await cloudinary.uploader.upload(dataURI, { folder: "AzizMovie" });
            uploadedUrls.push(result.secure_url);
        }
        res.json({ urls: uploadedUrls });
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        res.status(500).json({ error: 'Failed to upload files to Cloudinary.' });
    }
});

module.exports = app;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});