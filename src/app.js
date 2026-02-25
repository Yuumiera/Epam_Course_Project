const express = require('express');
const authRouter = require('./routes/auth');
const ideasRouter = require('./routes/ideas');

const app = express();

app.use(express.json());
app.use('/auth', authRouter);
app.use('/ideas', ideasRouter);

app.get('/', (req, res) => {
	res.json({ message: 'API running' });
});

module.exports = app;
