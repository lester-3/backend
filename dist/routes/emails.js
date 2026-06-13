"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const email_1 = __importDefault(require("../models/email"));
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const folder = req.query.folder;
        const search = req.query.search;
        const filter = {};
        if (folder && folder !== 'all') {
            filter.folder = folder;
        }
        if (search) {
            const re = new RegExp(search, 'i');
            filter.$or = [
                { subject: re },
                { from_name: re },
                { from_email: re },
                { body: re },
            ];
        }
        const emails = await email_1.default.find(filter).sort({ created_at: -1 });
        res.json(emails);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch emails' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const email = await email_1.default.findByIdAndUpdate(req.params.id, { read: 1 }, { new: true });
        if (!email) {
            res.status(404).json({ error: 'Email not found' });
            return;
        }
        res.json(email);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch email' });
    }
});
router.post('/', async (req, res) => {
    try {
        const payload = req.body;
        if (!payload.to_email || !payload.subject) {
            res.status(400).json({ error: 'to_email and subject are required' });
            return;
        }
        const email = new email_1.default({
            from_name: payload.from_name || 'Me',
            from_email: payload.from_email || 'me@nmail.com',
            to_name: payload.to_name || '',
            to_email: payload.to_email,
            subject: payload.subject,
            body: payload.body || '',
            folder: payload.folder || 'sent',
        });
        const saved = await email.save();
        res.status(201).json(saved);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to create email' });
    }
});
router.patch('/:id', async (req, res) => {
    try {
        const { folder, starred, read } = req.body;
        const updates = { updated_at: new Date() };
        if (folder !== undefined)
            updates.folder = folder;
        if (starred !== undefined)
            updates.starred = starred ? 1 : 0;
        if (read !== undefined)
            updates.read = read ? 1 : 0;
        if (Object.keys(updates).length === 0) {
            res.status(400).json({ error: 'No fields to update' });
            return;
        }
        const email = await email_1.default.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!email) {
            res.status(404).json({ error: 'Email not found' });
            return;
        }
        res.json(email);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to update email' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const result = await email_1.default.findByIdAndDelete(req.params.id);
        if (!result) {
            res.status(404).json({ error: 'Email not found' });
            return;
        }
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to delete email' });
    }
});
router.get('/stats/folders', async (_req, res) => {
    try {
        const total = await email_1.default.aggregate([
            { $group: { _id: '$folder', count: { $sum: 1 } } },
        ]);
        const unread = await email_1.default.aggregate([
            { $match: { read: 0 } },
            { $group: { _id: '$folder', count: { $sum: 1 } } },
        ]);
        res.json({ total, unread });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to get stats' });
    }
});
exports.default = router;
