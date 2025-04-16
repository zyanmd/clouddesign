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

// Use memory storage instead of disk storage for serverless environment
const storage = multer.memoryStorage();
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
      // With memory storage, the file is already in buffer
      fileBuffer = req.file.buffer;
      fileName = req.file.originalname;
    } else {
      // Handle text upload
      fileBuffer = Buffer.from(req.body.text, 'utf-8');
      fileName = 'upload.txt';
    }

    // Upload to CloudKuImages
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

// Start the server only if running directly (not when imported)
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

// Export the Express app for serverless deployment
module.exports = app;
