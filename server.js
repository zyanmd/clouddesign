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

const app = express();
const port = process.env.PORT || 3000;

// multer memory storage (no file system usage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// serve static files
app.use(express.static('public'));

// serve main HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// handle upload
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
      fileBuffer = req.file.buffer;
      fileName = req.file.originalname;
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

// export app for vercel
module.exports = app;

// for local dev
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}
