/*
──────────────────────────────────────────
🌩️ CloudKuImages Uploader Web Application
📦 Based on cloudku-uploader
──────────────────────────────────────────
*/

const express = require('express');
const multer = require('multer');
const path = require('path');
const uploadFile = require('cloudku-uploader');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Set up storage for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// Serve static files
app.use(express.static('public'));

// Serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Handle file uploads
app.post('/upload', upload.single('file'), async (req, res) => {
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

// Export app for vercel
module.exports = app;

// local dev only
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}
