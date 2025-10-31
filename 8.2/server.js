require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const users = [
  { id: 1, username: 'aditya', passwordHash: bcrypt.hashSync('password', 10), role: 'user' },
  { id: 2, username: 'admin', passwordHash: bcrypt.hashSync('adminpass', 10), role: 'admin' },
];

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_prod';
const TOKEN_EXPIRY = '15m';

function findUserByUsername(username) {
  return users.find(u => u.username === username);
}

app.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username & password required' });

  const user = findUserByUsername(username);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });

  const payload = { id: user.id, username: user.username, role: user.role };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

  res.json({ token, expiresIn: TOKEN_EXPIRY });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) return res.status(401).json({ error: 'Invalid or expired token' });
    req.user = { id: payload.id, username: payload.username, role: payload.role };
    next();
  });
}

app.get('/profile', authenticateToken, (req, res) => {
  res.json({ message: 'Profile info', user: req.user });
});

app.get('/auth/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(200).json({ valid: false });

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) return res.status(200).json({ valid: false });
    return res.json({ valid: true, user: payload });
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Auth server running on http://localhost:${PORT}`));
