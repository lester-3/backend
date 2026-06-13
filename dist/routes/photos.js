"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const config_1 = require("../config");
const photo_1 = __importDefault(require("../models/photo"));
if (!fs_1.default.existsSync(config_1.UPLOADS_DIR)) {
    fs_1.default.mkdirSync(config_1.UPLOADS_DIR, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, config_1.UPLOADS_DIR);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
function getUploadMiddleware() {
    return (req, res, next) => {
        const isVideo = req.headers['content-type']?.startsWith('video/');
        const limits = isVideo ? { fileSize: 5 * 1024 * 1024 } : { fileSize: 64 * 1024 };
        const upload = (0, multer_1.default)({ storage, limits }).single('file');
        upload(req, res, (err) => {
            if (err instanceof multer_1.default.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    const limit = isVideo ? '5MB' : '64KB';
                    res.status(413).json({ error: `File too large. Maximum size is ${limit}.` });
                    return;
                }
                res.status(400).json({ error: err.message });
                return;
            }
            if (err) {
                res.status(500).json({ error: 'Upload failed' });
                return;
            }
            // Enforce minimum 1MB for video files
            if (isVideo && req.file && req.file.size < 1024 * 1024) {
                fs_1.default.unlinkSync(req.file.path);
                res.status(413).json({ error: 'Video file too small. Minimum size is 1MB.' });
                return;
            }
            next();
        });
    };
}
const router = (0, express_1.Router)();
router.get('/', async (_req, res) => {
    try {
        const photos = await photo_1.default.find().sort({ created_at: -1 });
        res.json(photos);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch photos' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const photo = await photo_1.default.findById(req.params.id);
        if (!photo) {
            res.status(404).json({ error: 'Photo not found' });
            return;
        }
        res.json(photo);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch photo' });
    }
});
router.post('/', getUploadMiddleware(), async (req, res) => {
    try {
        const { label, dateTaken, timeTaken, description, tags } = req.body;
        const filePath = req.file ? req.file.filename : null;
        if (!label) {
            res.status(400).json({ error: 'label is required' });
            return;
        }
        const photo = new photo_1.default({
            label,
            file_path: filePath || '',
            dateTaken: dateTaken || '',
            timeTaken: timeTaken || '',
            description: description || '',
            tags: tags || '[]',
        });
        const saved = await photo.save();
        res.status(201).json(saved);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to create photo' });
    }
});
router.patch('/:id', async (req, res) => {
    try {
        const { label, month, color, dateTaken, timeTaken, description, tags } = req.body;
        const updates = {};
        if (label !== undefined)
            updates.label = label;
        if (month !== undefined)
            updates.month = month;
        if (color !== undefined)
            updates.color = color;
        if (dateTaken !== undefined)
            updates.dateTaken = dateTaken;
        if (timeTaken !== undefined)
            updates.timeTaken = timeTaken;
        if (description !== undefined)
            updates.description = description;
        if (tags !== undefined)
            updates.tags = tags;
        if (Object.keys(updates).length === 0) {
            res.status(400).json({ error: 'No fields to update' });
            return;
        }
        const photo = await photo_1.default.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!photo) {
            res.status(404).json({ error: 'Photo not found' });
            return;
        }
        res.json(photo);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to update photo' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const photo = await photo_1.default.findById(req.params.id);
        if (!photo) {
            res.status(404).json({ error: 'Photo not found' });
            return;
        }
        if (photo.file_path) {
            const fullPath = path_1.default.join(config_1.UPLOADS_DIR, photo.file_path);
            if (fs_1.default.existsSync(fullPath)) {
                fs_1.default.unlinkSync(fullPath);
            }
        }
        await photo_1.default.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to delete photo' });
    }
});
exports.default = router;
