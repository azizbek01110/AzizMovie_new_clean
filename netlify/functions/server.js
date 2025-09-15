const serverless = require('serverless-http');
const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Cloudinary konfiguratsiyasini olib tashlaymiz, chunki fayllar frontenddan yuklanadi.
// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
// });

app.use(cors());
app.use(express.static(path.join(__dirname, '..')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// `/upload` endpointini soddalashtiramiz, chunki fayllar to'g'ridan-to'g'ri Cloudinaryga yuklanadi
app.post('/upload', upload.array('files'), async (req, res) => {
    // Bu yerda faqat dummy URL'lar qaytaramiz, chunki haqiqiy yuklash frontendda bo'ladi
    // yoki bu endpointni butunlay olib tashlashimiz ham mumkin agar backendga hech qanday ma'lumot kerak bo'lmasa.
    console.log('Received upload request, but files are handled by frontend.');
    const dummyUrls = (req.files || []).map(file => `/dummy-uploads/${Date.now()}-${file.originalname}`);
    res.json({ urls: dummyUrls });
});

// Netlify funksiyasi sifatida eksport qilish
exports.handler = serverless(app);