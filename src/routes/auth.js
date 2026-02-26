const express = require('express');
const userStore = require('../store/userStore');
const authService = require('../services/authService');

const router = express.Router();

function isValidEmail(email) {
	return typeof email === 'string' && email.includes('@') && email.trim().length > 3;
}

function isValidPassword(password) {
	return typeof password === 'string' && password.length >= 8;
}

router.post('/register', async (req, res) => {
	const { email, password, role } = req.body || {};

	if (!isValidEmail(email) || !isValidPassword(password)) {
		return res.status(400).json({ error: 'Invalid email or password' });
	}

	const finalRole = role || 'submitter';
	if (!['submitter', 'admin'].includes(finalRole)) {
		return res.status(400).json({ error: 'Invalid role' });
	}

	try {
		const passwordHash = await authService.hashPassword(password);
		const user = await userStore.createUser({
			email,
			passwordHash,
			role: finalRole,
		});

		return res.status(201).json({
			id: user.id,
			email: user.email,
			role: user.role,
		});
	} catch (error) {
		if (error && error.code === 'DUPLICATE_EMAIL') {
			return res.status(409).json({ error: 'Email already exists' });
		}

		return res.status(500).json({ error: 'Internal server error' });
	}
});

router.post('/login', async (req, res) => {
	const { email, password } = req.body || {};

	if (!isValidEmail(email) || typeof password !== 'string') {
		return res.status(400).json({ error: 'Invalid email or password' });
	}

	const user = await userStore.findByEmail(email);
	if (!user) {
		return res.status(401).json({ error: 'Invalid credentials' });
	}

	const isPasswordValid = await authService.verifyPassword(password, user.passwordHash);
	if (!isPasswordValid) {
		return res.status(401).json({ error: 'Invalid credentials' });
	}

	const token = authService.createToken(user);
	return res.status(200).json({ token });
});

module.exports = router;
