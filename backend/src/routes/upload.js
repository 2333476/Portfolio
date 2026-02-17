const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../lib/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { requireAuth } = require('../middleware/auth');

// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const isPdf = file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf');
        return {
            folder: 'portfolio',
            resource_type: isPdf ? 'raw' : 'image',
            format: isPdf ? 'pdf' : undefined,
            type: 'upload',
            access_mode: 'public'
        };
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Upload Endpoint
router.post('/', requireAuth, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Return the Cloudinary secure URL
        res.json({
            success: true,
            url: req.file.path, // multer-storage-cloudinary puts the secure_url here by default if configured
            filename: req.file.filename,
            format: req.file.format
        });
    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ error: 'Upload failed' });
    }
});

module.exports = router;
