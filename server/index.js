const express = require('express');
const cors = require('cors');
const db = require('./database.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- Users & Auth ---
app.get('/api/users', (req, res) => {
  db.all(`SELECT * FROM users`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/auth/login', (req, res) => {
  const { id, password } = req.body;
  db.get(`SELECT * FROM users WHERE id = ? AND password = ?`, [id, password], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(401).json({ error: 'Invalid ID or password' });
    res.json(row);
  });
});

app.post('/api/auth/register', (req, res) => {
  const { id, name, password } = req.body;
  db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) return res.status(400).json({ error: 'User ID already exists' });
    
    db.run(`INSERT INTO users (id, name, role, password) VALUES (?, ?, ?, ?)`, [id, name, 'user', password], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, name, role: 'user', password });
    });
  });
});

app.post('/api/users/update', (req, res) => {
  const { id, name, role, password, isNew } = req.body;
  if (isNew) {
      db.run(`INSERT INTO users (id, name, role, password) VALUES (?, ?, ?, ?)`, [id, name, role, password], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id, name, role, password });
      });
  } else {
      db.run(`UPDATE users SET name = ?, role = ?, password = ? WHERE id = ?`, [name, role, password, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id, name, role, password });
      });
  }
});

// --- Books ---
app.get('/api/books', (req, res) => {
  db.all(`SELECT * FROM books`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/books', (req, res) => {
  const { id, title, author, type } = req.body;
  db.run(`INSERT INTO books (id, title, author, type, status) VALUES (?, ?, ?, ?, ?)`, [id, title, author, type, 'available'], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id, title, author, type, status: 'available' });
  });
});

app.post('/api/books/update', (req, res) => {
  const { id, title, type } = req.body;
  db.run(`UPDATE books SET title = ?, type = ? WHERE id = ?`, [title, type, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// --- Memberships ---
app.post('/api/memberships', (req, res) => {
  const { id, userId, duration, startDate } = req.body;
  db.run(`INSERT INTO memberships (id, userId, duration, startDate) VALUES (?, ?, ?, ?)`, [id, userId, duration, startDate], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id, userId, duration, startDate });
  });
});

// --- Transactions ---
app.get('/api/transactions', (req, res) => {
  db.all(`SELECT * FROM transactions`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/transactions/issue', (req, res) => {
  const { id, bookId, userId, issueDate, returnDate, remarks } = req.body;
  db.run(`UPDATE books SET status = 'issued' WHERE id = ?`, [bookId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    db.run(`INSERT INTO transactions (id, bookId, userId, issueDate, returnDate, isPaid, remarks) VALUES (?, ?, ?, ?, ?, 0, ?)`, 
      [id, bookId, userId, issueDate, returnDate, remarks], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
