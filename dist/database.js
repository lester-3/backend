"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbToArray = dbToArray;
exports.dbRun = dbRun;
exports.dbGet = dbGet;
exports.dbTransaction = dbTransaction;
exports.getDb = getDb;
exports.saveDb = saveDb;
exports.initializeDatabase = initializeDatabase;
const sql_js_1 = __importDefault(require("sql.js"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DB_PATH = path_1.default.join(__dirname, '..', 'nmail.db');
let db;
function dbToArray(sql, params) {
    const stmt = db.prepare(sql);
    if (params)
        stmt.bind(params);
    const results = [];
    while (stmt.step()) {
        results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
}
function dbRun(sql, params) {
    if (params) {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        stmt.step();
        stmt.free();
    }
    else {
        db.run(sql);
    }
}
function dbGet(sql, params) {
    const stmt = db.prepare(sql);
    if (params)
        stmt.bind(params);
    const result = stmt.step() ? stmt.getAsObject() : undefined;
    stmt.free();
    return result;
}
function dbTransaction(fn) {
    db.exec('BEGIN TRANSACTION');
    try {
        fn();
        db.exec('COMMIT');
    }
    catch (e) {
        db.exec('ROLLBACK');
        throw e;
    }
}
async function getDb() {
    if (db)
        return db;
    const SQL = await (0, sql_js_1.default)();
    if (fs_1.default.existsSync(DB_PATH)) {
        const buffer = fs_1.default.readFileSync(DB_PATH);
        db = new SQL.Database(buffer);
    }
    else {
        db = new SQL.Database();
    }
    db.run('PRAGMA foreign_keys = ON');
    return db;
}
function saveDb() {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs_1.default.writeFileSync(DB_PATH, buffer);
}
function initializeDatabase() {
    dbRun(`
    CREATE TABLE IF NOT EXISTS emails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_name TEXT NOT NULL DEFAULT '',
      from_email TEXT NOT NULL,
      to_name TEXT NOT NULL DEFAULT '',
      to_email TEXT NOT NULL,
      subject TEXT NOT NULL DEFAULT '',
      body TEXT NOT NULL DEFAULT '',
      folder TEXT NOT NULL DEFAULT 'inbox',
      starred INTEGER NOT NULL DEFAULT 0,
      read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
    dbRun(`
    CREATE TABLE IF NOT EXISTS labels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#1976d2'
    )
  `);
    dbRun(`
    CREATE TABLE IF NOT EXISTS email_labels (
      email_id INTEGER NOT NULL,
      label_id INTEGER NOT NULL,
      PRIMARY KEY (email_id, label_id),
      FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE,
      FOREIGN KEY (label_id) REFERENCES labels(id) ON DELETE CASCADE
    )
  `);
    dbRun(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT DEFAULT ''
    )
  `);
    dbRun(`
    CREATE TABLE IF NOT EXISTS photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      month TEXT,
      color TEXT DEFAULT '#4285f4',
      file_path TEXT,
      dateTaken TEXT,
      timeTaken TEXT,
      description TEXT,
      tags TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
    dbRun(`
    CREATE TABLE IF NOT EXISTS drive_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      size TEXT DEFAULT '0 MB',
      file_path TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
    dbRun(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT DEFAULT 'Me',
      email TEXT DEFAULT 'me@nmail.com',
      phone TEXT DEFAULT ''
    )
  `);
    const profileCount = dbGet('SELECT COUNT(*) as count FROM profile');
    if (profileCount?.count === 0) {
        dbRun('INSERT INTO profile (name, email, phone) VALUES (?, ?, ?)', ['Me', 'me@nmail.com', '']);
    }
    saveDb();
}
