const express = require('express');
const userStore = require('../store/userStore');
const authService = require('../services/authService');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

function isValidEmail(email) {
	return typeof email === 'string' && email.includes('@') && email.trim().length > 3;
}

function isValidPassword(password) {
	return typeof password === 'string' && password.length >= 8;
}

function isValidDisplayName(displayName) {
	return typeof displayName === 'string' && displayName.trim().length >= 2 && displayName.trim().length <= 50;
}

const ALLOWED_AVATAR_ANIMALS = new Set(['lizard', 'bear', 'cat', 'bird', 'dog', 'rabbit']);
const ALLOWED_AVATAR_ANIMAL_LIST = ['lizard', 'bear', 'cat', 'bird', 'dog', 'rabbit'];

function pickRandomAvatarAnimal() {
	const index = Math.floor(Math.random() * ALLOWED_AVATAR_ANIMAL_LIST.length);
	return ALLOWED_AVATAR_ANIMAL_LIST[index];
}

router.post('/register', async (req, res) => {
	const { email, password, role, displayName, avatarAnimal } = req.body || {};

	if (!isValidEmail(email) || !isValidPassword(password)) {
		return res.status(400).json({ error: 'Invalid email or password' });
	}

	const derivedDisplayName = typeof email === 'string' ? String(email).trim().split('@')[0] : 'User';
	const finalDisplayName = typeof displayName === 'string' && displayName.trim().length > 0
		? displayName.trim()
		: derivedDisplayName;

	if (!isValidDisplayName(finalDisplayName)) {
		return res.status(400).json({ error: 'Invalid display name' });
	}

	const finalRole = role || 'submitter';
	if (!['submitter', 'admin'].includes(finalRole)) {
		return res.status(400).json({ error: 'Invalid role' });
	}

	if (avatarAnimal !== undefined && avatarAnimal !== null && avatarAnimal !== '' && !ALLOWED_AVATAR_ANIMALS.has(avatarAnimal)) {
		return res.status(400).json({ error: 'Invalid avatar' });
	}

	const finalAvatarAnimal = typeof avatarAnimal === 'string' && avatarAnimal.trim() !== ''
		? avatarAnimal
		: pickRandomAvatarAnimal();

	try {
		const passwordHash = await authService.hashPassword(password);
		const user = await userStore.createUser({
			email,
			passwordHash,
			role: finalRole,
			displayName: finalDisplayName,
			avatarAnimal: finalAvatarAnimal,
		});

		return res.status(201).json({
			id: user.id,
			email: user.email,
			role: user.role,
			displayName: user.displayName,
			avatarAnimal: user.avatarAnimal,
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
	return res.status(200).json({
		token,
		user: {
			id: user.id,
			email: user.email,
			role: user.role,
			displayName: user.displayName,
			avatarAnimal: user.avatarAnimal,
		},
	});
});

router.patch('/profile/avatar', authMiddleware, async (req, res) => {
	const { avatarAnimal } = req.body || {};

	if (!ALLOWED_AVATAR_ANIMALS.has(avatarAnimal)) {
		return res.status(400).json({ error: 'Invalid avatar' });
	}

	try {
		const updatedUser = await userStore.updateAvatarById({
			id: req.user.id,
			avatarAnimal,
		});

		const token = authService.createToken(updatedUser);

		return res.status(200).json({
			token,
			user: {
				id: updatedUser.id,
				email: updatedUser.email,
				role: updatedUser.role,
				displayName: updatedUser.displayName,
				avatarAnimal: updatedUser.avatarAnimal,
			},
		});
	} catch (error) {
		return res.status(500).json({ error: 'Internal server error' });
	}
});

module.exports = router;
