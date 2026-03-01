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

	const historyList = Array.isArray(idea.evaluationHistory)
		? idea.evaluationHistory.map((entry) => ({
			status: entry.status,
			comment: entry.comment ?? null,
			reviewerId: entry.reviewerId,
			timestamp: entry.timestamp,
		}))
		: [];

	return {
		id: idea.id,
		title: idea.title,
		description: idea.description,
		category: idea.category,
		status: idea.status,
		comment: idea.comment ?? null,
		impactScore: idea.impactScore ?? null,
		feasibilityScore: idea.feasibilityScore ?? null,
		innovationScore: idea.innovationScore ?? null,
		totalScore: idea.totalScore ?? null,
		scoredByAdminId: idea.scoredByAdminId ?? null,
		scoredAt: idea.scoredAt ?? null,
		rank: typeof idea.rank === 'number' ? idea.rank : null,
		createdByUserId: idea.createdByUserId,
		attachment: mapAttachment(idea),
		evaluationHistory: historyList,
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
		include: {
			evaluationHistory: {
				orderBy: {
					timestamp: 'asc',
				},
			},
		},
	});

	return toIdeaDto(idea);
}

function sortIdeasForRankedView(ideas) {
	const cloned = [...ideas];
	cloned.sort((left, right) => {
		const leftHasScore = typeof left.totalScore === 'number';
		const rightHasScore = typeof right.totalScore === 'number';

		if (leftHasScore && rightHasScore) {
			if (right.totalScore !== left.totalScore) {
				return right.totalScore - left.totalScore;
			}
		}

		if (leftHasScore !== rightHasScore) {
			return leftHasScore ? -1 : 1;
		}

		const leftCreatedAt = new Date(left.createdAt).getTime();
		const rightCreatedAt = new Date(right.createdAt).getTime();
		if (leftCreatedAt !== rightCreatedAt) {
			return leftCreatedAt - rightCreatedAt;
		}

		return String(left.id).localeCompare(String(right.id));
	});

	return cloned;
}

async function listIdeasRanked() {
	const ideas = await prisma.idea.findMany();
	const sorted = sortIdeasForRankedView(ideas);
	return sorted.map((idea, index) => toIdeaDto({ ...idea, rank: index + 1 }));
}

async function updateIdeaScore({ id, impact, feasibility, innovation, adminUserId }) {
	const totalScore = Number(((impact + feasibility + innovation) / 3).toFixed(2));

	const result = await prisma.idea.updateMany({
		where: {
			id: String(id),
		},
		data: {
			impactScore: impact,
			feasibilityScore: feasibility,
			innovationScore: innovation,
			totalScore,
			scoredByAdminId: String(adminUserId),
			scoredAt: new Date(),
		},
	});

	if (result.count === 0) {
		return null;
	}

	return getIdeaById(id);
}

async function updateIdeaStatusWithHistory({ id, status, comment, reviewerId }) {
	const result = await prisma.$transaction(async (tx) => {
		const idea = await tx.idea.findUnique({
			where: {
				id: String(id),
			},
		});

		if (!idea) {
			return null;
		}

		const updatedIdea = await tx.idea.update({
			where: {
				id: String(id),
			},
			data: {
				status,
				comment,
			},
		});

		const historyEntry = await tx.evaluationHistory.create({
			data: {
				ideaId: String(id),
				status,
				comment,
				reviewerId: String(reviewerId),
			},
		});

		return {
			idea: updatedIdea,
			historyEntry: {
				status: historyEntry.status,
				comment: historyEntry.comment ?? null,
				reviewerId: historyEntry.reviewerId,
				timestamp: historyEntry.timestamp,
			},
		};
	});

	if (!result) {
		return null;
	}

	return {
		idea: toIdeaDto(result.idea),
		historyEntry: result.historyEntry,
	};
}

async function updateDraftByOwner({ id, ownerUserId, title, description, category, attachment }) {
	const updateData = {
		title,
		description,
		category,
	};

	if (attachment) {
		updateData.attachmentFilename = attachment.filename;
		updateData.attachmentMimeType = attachment.mimeType;
		updateData.attachmentSizeBytes = attachment.sizeBytes;
		updateData.attachmentStoragePath = attachment.storagePath;
	}

	const result = await prisma.idea.updateMany({
		where: {
			id: String(id),
			createdByUserId: String(ownerUserId),
			status: 'draft',
		},
		data: updateData,
	});

	if (result.count === 0) {
		return null;
	}

	return getIdeaById(id);
}

async function submitDraftByOwner({ id, ownerUserId }) {
	const result = await prisma.idea.updateMany({
		where: {
			id: String(id),
			createdByUserId: String(ownerUserId),
			status: 'draft',
		},
		data: {
			status: 'submitted',
		},
	});

	if (result.count === 0) {
		return null;
	}

	return getIdeaById(id);
}

async function reset() {
	await prisma.evaluationHistory.deleteMany();
	await prisma.idea.deleteMany();
}

module.exports = {
	createIdea,
	listIdeas,
	listIdeasRanked,
	getIdeaById,
	updateIdeaScore,
	updateIdeaStatusWithHistory,
	updateDraftByOwner,
	submitDraftByOwner,
	reset,
};
