const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const config = require('../config/config');

const dbPath = path.resolve(config.database.path);

// Ensure the data directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sqlite = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

// Enable WAL mode and foreign keys
sqlite.run('PRAGMA journal_mode=WAL');
sqlite.run('PRAGMA foreign_keys=ON');

// Promise wrappers
const db = {
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      sqlite.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      sqlite.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      sqlite.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  exec(sql) {
    return new Promise((resolve, reject) => {
      sqlite.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

// Initialize tables from init.sql
async function initDatabase() {
  const initSQL = fs.readFileSync(
    path.join(__dirname, 'init.sql'),
    'utf-8'
  );
  await db.exec(initSQL);
  console.log('Database tables initialized');
}

module.exports = { db, initDatabase };
