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
const profile_1 = __importDefault(require("../models/profile"));
if (!fs_1.default.existsSync(config_1.UPLOADS_DIR)) {
    fs_1.default.mkdirSync(config_1.UPLOADS_DIR, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, config_1.UPLOADS_DIR),
    filename: (_req, file, cb) => cb(null, 'avatar' + path_1.default.extname(file.originalname)),
});
const upload = (0, multer_1.default)({ storage, limits: { fileSize: 64 * 1024 } });
const router = (0, express_1.Router)();
router.get('/', async (_req, res) => {
    try {
        let profile = await profile_1.default.findOne();
        if (!profile) {
            profile = await profile_1.default.create({
                name: 'Me',
                email: 'me@nmail.com',
                phone: '',
                avatar_path: '',
            });
        }
        res.json(profile);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});
router.patch('/', async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        const updates = {};
        if (name !== undefined)
            updates.name = name;
        if (email !== undefined)
            updates.email = email;
        if (phone !== undefined)
            updates.phone = phone;
        if (Object.keys(updates).length === 0) {
            res.status(400).json({ error: 'No fields to update' });
            return;
        }
        const profile = await profile_1.default.findOneAndUpdate({}, updates, {
            new: true,
            upsert: true,
        });
        res.json(profile);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
});
router.post('/avatar', upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }
        if (req.file.size > 64 * 1024) {
            fs_1.default.unlinkSync(req.file.path);
            res.status(413).json({ error: 'File too large. Maximum size is 64KB.' });
            return;
        }
        const profile = await profile_1.default.findOneAndUpdate({}, { avatar_path: req.file.filename }, { new: true, upsert: true });
        res.json(profile);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to upload avatar' });
    }
});
exports.default = router;
