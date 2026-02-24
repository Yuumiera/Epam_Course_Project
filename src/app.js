const express = require('express');
const authRouter = require('./routes/auth');

const app = express();

app.use(express.json());
app.use('/auth', authRouter);

app.get('/', (req, res) => {
	res.json({ message: 'API running' });
});

module.exports = app;
