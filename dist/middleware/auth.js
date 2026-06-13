"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.validateCredentials = validateCredentials;
exports.authMiddleware = authMiddleware;
const crypto_1 = __importDefault(require("crypto"));
const AUTH_EMAIL = process.env.AUTH_EMAIL || 'nMAIL@gmail.com';
const AUTH_PASSWORD = process.env.AUTH_PASSWORD || '123456';
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'nmail-secret-key-2024';
function generateToken(email) {
    const payload = JSON.stringify({ email, exp: Date.now() + 24 * 60 * 60 * 1000 });
    const hmac = crypto_1.default.createHmac('sha256', TOKEN_SECRET);
    hmac.update(payload);
    const sig = hmac.digest('hex');
    return Buffer.from(payload).toString('base64') + '.' + sig;
}
function verifyToken(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 2)
            return null;
        const payloadStr = Buffer.from(parts[0], 'base64').toString('utf8');
        const hmac = crypto_1.default.createHmac('sha256', TOKEN_SECRET);
        hmac.update(payloadStr);
        const expectedSig = hmac.digest('hex');
        if (parts[1] !== expectedSig)
            return null;
        const payload = JSON.parse(payloadStr);
        if (payload.exp < Date.now())
            return null;
        if (payload.email !== AUTH_EMAIL)
            return null;
        return { email: payload.email };
    }
    catch {
        return null;
    }
}
function validateCredentials(email, password) {
    return email === AUTH_EMAIL && password === AUTH_PASSWORD;
}
function authMiddleware(req, res, next) {
    if (res.headersSent) {
        next();
        return;
    }
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    const token = authHeader.slice(7);
    const result = verifyToken(token);
    if (!result) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
    }
    next();
}
