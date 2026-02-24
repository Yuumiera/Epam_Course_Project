let users = [];
let nextId = 1;

function normalizeEmail(email) {
	return String(email).trim().toLowerCase();
}

function createUser({ email, passwordHash, role }) {
	const normalizedEmail = normalizeEmail(email);
	const existingUser = users.find((user) => user.email === normalizedEmail);

	if (existingUser) {
		const error = new Error('Email already exists');
		error.code = 'DUPLICATE_EMAIL';
		throw error;
	}

	const user = {
		id: String(nextId++),
		email: normalizedEmail,
		passwordHash,
		role,
	};

	users.push(user);
	return user;
}

function findByEmail(email) {
	const normalizedEmail = normalizeEmail(email);
	return users.find((user) => user.email === normalizedEmail) || null;
}

function reset() {
	users = [];
	nextId = 1;
}

module.exports = {
	createUser,
	findByEmail,
	reset,
};
