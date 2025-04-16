const multer = require('multer');
const uploadFile = require('cloudku-uploader');
const express = require('express');
const app = express();

// Set up multer with memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage }).single('file');

// Export handler function for Vercel serverless
module.exports = (req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Handle only POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method Not Allowed' });
  }

  // Process the upload
  upload(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(500).json({ status: 'error', message: err.message });
    }
    
    try {
      let fileBuffer, fileName;

      if (req.file) {
        console.log('File upload detected');
        fileBuffer = req.file.buffer;
        fileName = req.file.originalname;
      } else if (req.body && req.body.text) {
        console.log('Text upload detected');
        fileBuffer = Buffer.from(req.body.text, 'utf-8');
        fileName = 'upload.txt';
      } else {
        return res.status(400).json({ 
          status: 'error', 
          message: 'No file or text provided' 
        });
      }

      console.log('Uploading to CloudKuImages...');
      const result = await uploadFile(fileBuffer, fileName);
      console.log('Upload result:', JSON.stringify(result));

      if (result?.status === 'success') {
        return res.json({
          status: 'success',
          result: result.result,
          information: result.information || 'https://cloudkuimages.guru/ch'
        });
      } else {
        return res.status(500).json({
          status: 'error',
          message: 'Upload failed',
          details: result
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        details: error.message
      });
    }
  });
};

// Export the Express app for serverless deployment
module.exports = app;
