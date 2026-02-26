const prisma = require('../lib/prisma');

function mapAttachment(idea) {
	if (!idea.attachmentFilename) {
		return null;
	}

	return {
		filename: idea.attachmentFilename,
		mimeType: idea.attachmentMimeType,
		sizeBytes: idea.attachmentSizeBytes,
		storagePath: idea.attachmentStoragePath,
	};
}

function toIdeaDto(idea) {
	if (!idea) {
		return null;
	}

	return {
		id: idea.id,
		title: idea.title,
		description: idea.description,
		category: idea.category,
		status: idea.status,
		comment: idea.comment ?? null,
		createdByUserId: idea.createdByUserId,
		attachment: mapAttachment(idea),
	};
}

async function createIdea({ title, description, category, status, createdByUserId, attachment = null }) {
	const idea = await prisma.idea.create({
		data: {
			title,
			description,
			category,
			status,
			createdByUserId: String(createdByUserId),
			attachmentFilename: attachment?.filename ?? null,
			attachmentMimeType: attachment?.mimeType ?? null,
			attachmentSizeBytes: attachment?.sizeBytes ?? null,
			attachmentStoragePath: attachment?.storagePath ?? null,
		},
	});

	return toIdeaDto(idea);
}

async function listIdeas() {
	const ideas = await prisma.idea.findMany({
		orderBy: {
			createdAt: 'asc',
		},
	});

	return ideas.map(toIdeaDto);
}

async function getIdeaById(id) {
	const idea = await prisma.idea.findUnique({
		where: {
			id: String(id),
		},
	});

	return toIdeaDto(idea);
}

async function updateIdeaStatus(id, status, comment) {
	try {
		const idea = await prisma.idea.update({
			where: {
				id: String(id),
			},
			data: {
				status,
				comment,
			},
		});

		return toIdeaDto(idea);
	} catch (error) {
		if (error && error.code === 'P2025') {
			return null;
		}

		throw error;
	}
}

async function reset() {
	await prisma.idea.deleteMany();
}

module.exports = {
	createIdea,
	listIdeas,
	getIdeaById,
	updateIdeaStatus,
	reset,
};
