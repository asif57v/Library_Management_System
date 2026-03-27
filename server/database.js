const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'library.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    role TEXT,
    password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY,
    title TEXT,
    author TEXT,
    type TEXT,
    status TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    bookId TEXT,
    userId TEXT,
    issueDate TEXT,
    returnDate TEXT,
    actualReturnDate TEXT,
    amount REAL,
    isPaid INTEGER,
    remarks TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS memberships (
    id TEXT PRIMARY KEY,
    userId TEXT,
    duration INTEGER,
    startDate TEXT
  )`);

  // Seed default users
  db.get(`SELECT id FROM users WHERE id = 'admin'`, (err, row) => {
    if (!row) {
      db.run(`INSERT INTO users (id, name, role, password) VALUES ('admin', 'Admin User', 'admin', 'adminpassword')`);
    }
  });

  db.get(`SELECT id FROM users WHERE id = 'user'`, (err, row) => {
    if (!row) {
      db.run(`INSERT INTO users (id, name, role, password) VALUES ('user', 'Regular User', 'user', 'userpassword')`);
    }
  });

  // Seed initial books
  db.get(`SELECT count(*) as count FROM books`, (err, row) => {
    if (row && row.count === 0) {
      const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);
      db.run(`INSERT INTO books (id, title, author, type, status) VALUES (?, ?, ?, ?, ?)`, 
        [generateId(), 'The Great Gatsby', 'F. Scott Fitzgerald', 'book', 'available']);
      db.run(`INSERT INTO books (id, title, author, type, status) VALUES (?, ?, ?, ?, ?)`, 
        [generateId(), 'Inception', 'Christopher Nolan', 'movie', 'available']);
      db.run(`INSERT INTO books (id, title, author, type, status) VALUES (?, ?, ?, ?, ?)`, 
        [generateId(), 'To Kill a Mockingbird', 'Harper Lee', 'book', 'available']);
    }
  });
});

module.exports = db;
