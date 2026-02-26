const prisma = require('../lib/prisma');

function normalizeEmail(email) {
	return String(email).trim().toLowerCase();
}

function toUserDto(user) {
	if (!user) {
		return null;
	}

	return {
		id: user.id,
		email: user.email,
		passwordHash: user.passwordHash,
		role: user.role,
	};
}

async function createUser({ email, passwordHash, role }) {
	const normalizedEmail = normalizeEmail(email);

	try {
		const user = await prisma.user.create({
			data: {
				email: normalizedEmail,
				passwordHash,
				role,
			},
		});

		return toUserDto(user);
	} catch (error) {
		if (error && error.code === 'P2002') {
			const duplicateEmailError = new Error('Email already exists');
			duplicateEmailError.code = 'DUPLICATE_EMAIL';
			throw duplicateEmailError;
		}

		throw error;
	}
}

async function findByEmail(email) {
	const normalizedEmail = normalizeEmail(email);
	const user = await prisma.user.findUnique({
		where: {
			email: normalizedEmail,
		},
	});

	return toUserDto(user);
}

async function reset() {
	await prisma.idea.deleteMany();
	await prisma.user.deleteMany();
}

module.exports = {
	createUser,
	findByEmail,
	reset,
};
