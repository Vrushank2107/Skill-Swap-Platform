"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = initializeDatabase;
exports.getDb = getDb;
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
const path_1 = __importDefault(require("path"));
let db;
async function initializeDatabase() {
    if (db)
        return db;
    db = await (0, sqlite_1.open)({
        filename: path_1.default.join(__dirname, '../../data/skill_swap.db'),
        driver: sqlite3_1.default.Database
    });
    // Users table
    await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT,
      photo TEXT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      is_admin INTEGER DEFAULT 0,
      is_banned INTEGER DEFAULT 0,
      is_public INTEGER DEFAULT 1,
      availability TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
    // Skills table
    await db.exec(`
    CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      skill_name TEXT NOT NULL,
      type TEXT CHECK(type IN ('offered', 'wanted')) NOT NULL,
      description TEXT,
      approved INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);
    // Swaps table
    await db.exec(`
    CREATE TABLE IF NOT EXISTS swaps (
      id TEXT PRIMARY KEY,
      requester_id TEXT NOT NULL,
      responder_id TEXT NOT NULL,
      offered_skill_id TEXT NOT NULL,
      wanted_skill_id TEXT NOT NULL,
      status TEXT CHECK(status IN ('pending', 'accepted', 'rejected', 'cancelled')) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME,
      FOREIGN KEY(requester_id) REFERENCES users(id),
      FOREIGN KEY(responder_id) REFERENCES users(id),
      FOREIGN KEY(offered_skill_id) REFERENCES skills(id),
      FOREIGN KEY(wanted_skill_id) REFERENCES skills(id)
    );
  `);
    // Feedback table
    await db.exec(`
    CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY,
      swap_id TEXT NOT NULL,
      from_user_id TEXT NOT NULL,
      to_user_id TEXT NOT NULL,
      rating INTEGER CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(swap_id) REFERENCES swaps(id),
      FOREIGN KEY(from_user_id) REFERENCES users(id),
      FOREIGN KEY(to_user_id) REFERENCES users(id)
    );
  `);
    // Admin actions table
    await db.exec(`
    CREATE TABLE IF NOT EXISTS admin_actions (
      id TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL,
      action_type TEXT NOT NULL,
      target_user_id TEXT,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(admin_id) REFERENCES users(id)
    );
  `);
    return db;
}
function getDb() {
    if (!db)
        throw new Error('Database not initialized!');
    return db;
}
//# sourceMappingURL=init.js.map