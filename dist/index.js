"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("./config");
const db_1 = require("./db");
const seed_1 = require("./seed");
const auth_1 = require("./middleware/auth");
const auth_2 = __importDefault(require("./routes/auth"));
const emails_1 = __importDefault(require("./routes/emails"));
const contacts_1 = __importDefault(require("./routes/contacts"));
const photos_1 = __importDefault(require("./routes/photos"));
const drive_1 = __importDefault(require("./routes/drive"));
const profile_1 = __importDefault(require("./routes/profile"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '50mb' }));
app.use('/uploads', express_1.default.static(config_1.UPLOADS_DIR));
app.use('/api/uploads', express_1.default.static(config_1.UPLOADS_DIR));
app.use('/api/auth', auth_2.default);
app.use(auth_1.authMiddleware);
app.use('/api/emails', emails_1.default);
app.use('/api/contacts', contacts_1.default);
app.use('/api/photos', photos_1.default);
app.use('/api/drive', drive_1.default);
app.use('/api/profile', profile_1.default);
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
async function start() {
    await (0, db_1.connectDB)();
    await (0, seed_1.seedDatabase)();
    app.listen(PORT, () => {
        console.log(`nmail backend running on http://localhost:${PORT}`);
    });
}
// Only call start() when not in serverless (Vercel) environment
if (!process.env.VERCEL) {
    start().catch(console.error);
}
exports.default = app;
