const jwt = require('jsonwebtoken');
const userStore = require('../store/userStore');

async function authMiddleware(req, res, next) {
	const authHeader = req.headers.authorization;

	if (!authHeader || typeof authHeader !== 'string') {
		return res.status(401).json({ error: 'Unauthorized' });
	}

	const [scheme, token] = authHeader.split(' ');
	if (scheme !== 'Bearer' || !token) {
		return res.status(401).json({ error: 'Unauthorized' });
	}

	const secret = process.env.JWT_SECRET || 'dev-secret';

	try {
		const decoded = jwt.verify(token, secret);
		const user = await userStore.findById(decoded.sub);
		if (!user) {
			return res.status(401).json({ error: 'Unauthorized' });
		}

		req.user = {
			id: user.id,
			role: user.role,
		};

		return next();
	} catch (error) {
		return res.status(401).json({ error: 'Unauthorized' });
	}
}

module.exports = authMiddleware;
