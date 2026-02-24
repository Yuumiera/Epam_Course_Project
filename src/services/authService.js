const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;
const JWT_EXPIRES_IN = '24h';

function hashPassword(plain) {
	return bcrypt.hash(plain, SALT_ROUNDS);
}

function verifyPassword(plain, hash) {
	return bcrypt.compare(plain, hash);
}

function createToken(user) {
	const secret = process.env.JWT_SECRET || 'dev-secret';

	return jwt.sign(
		{ role: user.role },
		secret,
		{
			subject: String(user.id),
			expiresIn: JWT_EXPIRES_IN,
		},
	);
}

module.exports = {
	hashPassword,
	verifyPassword,
	createToken,
};
