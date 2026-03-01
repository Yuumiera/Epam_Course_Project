const express = require('express');
const path = require('path');
const authRouter = require('./routes/auth');
const ideasRouter = require('./routes/ideas');

const app = express();
const publicDir = path.join(__dirname, '../public');

app.use(express.json());
app.use(express.static(publicDir));
app.use('/auth', authRouter);
app.use('/ideas', ideasRouter);

app.get(['/login', '/register', '/dashboard'], (req, res) => {
	res.sendFile(path.join(publicDir, 'index.html'));
});

app.get('/', (req, res) => {
	res.redirect('/login');
});

module.exports = app;
