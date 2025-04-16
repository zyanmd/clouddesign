// ──────────────────────────────────────────
// 🌩️ CloudKuImages Uploader Web Application
// 📦 Based on cloudku-uploader
// Vercel-compatible version
// ──────────────────────────────────────────

const express = require('express');
const multer = require('multer');
const path = require('path');
const uploadFile = require('cloudku-uploader');
const fs = require('fs');
const serverless = require('serverless-http');

const app = express();

// middleware for static files (vercel only serves api, so serve via frontend if needed)
app.use(express.static(path.join(__dirname, '..', 'public')));

// multer storage setup (save to tmp dir on vercel)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = '/tmp/uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// upload endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file && !req.body.text) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'No file or text provided' 
      });
    }

    let fileBuffer, fileName;

    if (req.file) {
      const filePath = req.file.path;
      fileBuffer = fs.readFileSync(filePath);
      fileName = req.file.originalname;

      // cleanup (optional on vercel, but good practice)
      fs.unlinkSync(filePath);
    } else {
      fileBuffer = Buffer.from(req.body.text, 'utf-8');
      fileName = 'upload.txt';
    }

    const result = await uploadFile(fileBuffer, fileName);

    if (result?.status === 'success') {
      res.json({
        status: 'success',
        result: result.result,
        information: result.information || 'https://cloudkuimages.guru/ch'
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Upload failed',
        details: result
      });
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      details: error.message
    });
  }
});

// export handler
module.exports = app;
module.exports.handler = serverless(app);
