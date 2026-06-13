"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
    }
    if (!(0, auth_1.validateCredentials)(email, password)) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
    }
    const token = (0, auth_1.generateToken)(email);
    res.json({ token, email, name: 'nMAIL Admin' });
});
exports.default = router;
