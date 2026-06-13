"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UPLOADS_DIR = void 0;
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
exports.UPLOADS_DIR = process.env.VERCEL
    ? path_1.default.join(os_1.default.tmpdir(), 'uploads')
    : path_1.default.join(__dirname, '..', 'uploads');
