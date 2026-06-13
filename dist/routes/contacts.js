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
const contact_1 = __importDefault(require("../models/contact"));
if (!fs_1.default.existsSync(config_1.UPLOADS_DIR)) {
    fs_1.default.mkdirSync(config_1.UPLOADS_DIR, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, config_1.UPLOADS_DIR),
    filename: (_req, file, cb) => cb(null, 'contact-avatar-' + Date.now() + path_1.default.extname(file.originalname)),
});
const router = (0, express_1.Router)();
router.get('/', async (_req, res) => {
    try {
        const contacts = await contact_1.default.find().sort({ name: 1 });
        res.json(contacts);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch contacts' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const contact = await contact_1.default.findById(req.params.id);
        if (!contact) {
            res.status(404).json({ error: 'Contact not found' });
            return;
        }
        res.json(contact);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch contact' });
    }
});
router.post('/', async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        if (!name || !email) {
            res.status(400).json({ error: 'name and email are required' });
            return;
        }
        const contact = new contact_1.default({ name, email, phone: phone || '' });
        const saved = await contact.save();
        res.status(201).json(saved);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to create contact' });
    }
});
router.patch('/:id', async (req, res) => {
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
        const contact = await contact_1.default.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!contact) {
            res.status(404).json({ error: 'Contact not found' });
            return;
        }
        res.json(contact);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to update contact' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const result = await contact_1.default.findByIdAndDelete(req.params.id);
        if (!result) {
            res.status(404).json({ error: 'Contact not found' });
            return;
        }
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to delete contact' });
    }
});
// Avatar upload for contacts
const avatarUpload = (0, multer_1.default)({ storage, limits: { fileSize: 64 * 1024 } });
router.post('/:id/avatar', avatarUpload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }
        const contact = await contact_1.default.findByIdAndUpdate(req.params.id, { avatar_path: req.file.filename }, { new: true });
        if (!contact) {
            fs_1.default.unlinkSync(req.file.path);
            res.status(404).json({ error: 'Contact not found' });
            return;
        }
        res.json(contact);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to upload avatar' });
    }
});
exports.default = router;
