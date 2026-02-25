const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
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
		req.user = {
			id: decoded.sub,
			role: decoded.role,
		};

		return next();
	} catch (error) {
		return res.status(401).json({ error: 'Unauthorized' });
	}
}

module.exports = authMiddleware;
