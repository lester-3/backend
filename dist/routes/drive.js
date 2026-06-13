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
const driveFile_1 = __importDefault(require("../models/driveFile"));
if (!fs_1.default.existsSync(config_1.UPLOADS_DIR)) {
    fs_1.default.mkdirSync(config_1.UPLOADS_DIR, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, config_1.UPLOADS_DIR),
    filename: (_req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path_1.default.extname(file.originalname)),
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
        const files = await driveFile_1.default.find().sort({ created_at: -1 });
        res.json(files);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch files' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const file = await driveFile_1.default.findById(req.params.id);
        if (!file) {
            res.status(404).json({ error: 'File not found' });
            return;
        }
        res.json(file);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch file' });
    }
});
router.post('/', getUploadMiddleware(), async (req, res) => {
    try {
        const { name, type, size } = req.body;
        const fileName = name || (req.file ? req.file.originalname : 'untitled');
        const fileType = type || (req.file ? (req.file.mimetype.startsWith('video/') ? 'video' : 'image') : 'image');
        const fileSize = size || (req.file ? `${(req.file.size / 1024 / 1024).toFixed(1)} MB` : '0 MB');
        const filePath = req.file ? req.file.filename : '';
        const driveFile = new driveFile_1.default({
            name: fileName,
            type: fileType,
            size: fileSize,
            file_path: filePath,
        });
        const saved = await driveFile.save();
        res.status(201).json(saved);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to create file' });
    }
});
router.patch('/:id', async (req, res) => {
    try {
        const { name, type, size } = req.body;
        const updates = {};
        if (name !== undefined)
            updates.name = name;
        if (type !== undefined)
            updates.type = type;
        if (size !== undefined)
            updates.size = size;
        if (Object.keys(updates).length === 0) {
            res.status(400).json({ error: 'No fields to update' });
            return;
        }
        const file = await driveFile_1.default.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!file) {
            res.status(404).json({ error: 'File not found' });
            return;
        }
        res.json(file);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to update file' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const file = await driveFile_1.default.findById(req.params.id);
        if (!file) {
            res.status(404).json({ error: 'File not found' });
            return;
        }
        if (file.file_path) {
            const fullPath = path_1.default.join(config_1.UPLOADS_DIR, file.file_path);
            if (fs_1.default.existsSync(fullPath)) {
                fs_1.default.unlinkSync(fullPath);
            }
        }
        await driveFile_1.default.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to delete file' });
    }
});
exports.default = router;
