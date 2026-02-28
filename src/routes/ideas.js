const express = require('express');
const fs = require('fs');
const path = require('path');
const authMiddleware = require('../middlewares/auth');
const { singleIdeaAttachment } = require('../middlewares/upload');
const ideaStore = require('../store/ideaStore');
const userStore = require('../store/userStore');

const router = express.Router();
const ALLOWED_EVALUATION_STATUSES = new Set(['under_review', 'approved_for_final', 'accepted', 'rejected']);
const ALLOWED_IDEA_CATEGORIES = new Set(['HR', 'Process', 'Technology', 'Quality', 'Culture', 'Other']);
const ALLOWED_CREATE_STATUSES = new Set(['draft', 'submitted']);
const REVIEW_TRANSITIONS = {
	submitted: new Set(['under_review']),
	under_review: new Set(['approved_for_final']),
	approved_for_final: new Set(['accepted', 'rejected']),
};
const MASKED_IDENTITY_FIELDS = ['createdByUserId'];
const TITLE_MIN_LENGTH = 3;
const TITLE_MAX_LENGTH = 120;
const DESCRIPTION_MIN_LENGTH = 20;
const DESCRIPTION_MAX_LENGTH = 2000;

function validateIdeaPayload(payload) {
	const fieldErrors = {};
	const title = typeof payload?.title === 'string' ? payload.title.trim() : '';
	const description = typeof payload?.description === 'string' ? payload.description.trim() : '';
	const category = typeof payload?.category === 'string' ? payload.category.trim() : '';

	if (title.length < TITLE_MIN_LENGTH || title.length > TITLE_MAX_LENGTH) {
		fieldErrors.title = `Title must be between ${TITLE_MIN_LENGTH} and ${TITLE_MAX_LENGTH} characters.`;
	}

	if (description.length < DESCRIPTION_MIN_LENGTH || description.length > DESCRIPTION_MAX_LENGTH) {
		fieldErrors.description = `Description must be between ${DESCRIPTION_MIN_LENGTH} and ${DESCRIPTION_MAX_LENGTH} characters.`;
	}

	if (!ALLOWED_IDEA_CATEGORIES.has(category)) {
		fieldErrors.category = 'Category is invalid.';
	}

	return {
		fieldErrors,
		normalized: {
			title,
			description,
			category,
		},
	};
}

function buildAttachmentMetadata(file) {
	if (!file) {
		return null;
	}

	return {
		filename: file.originalname,
		mimeType: file.mimetype,
		sizeBytes: file.size,
		storagePath: file.path,
	};
}

function shouldIncludeCreatorIdentity(user, idea) {
	if (!user || !idea) {
		return false;
	}

	if (user.role === 'admin') {
		return false;
	}

	return String(user.id) === String(idea.createdByUserId);
}

function serializeIdea(idea, options = {}) {
	const includeCreatorIdentity = options.includeCreatorIdentity === true;
	const serialized = {
		id: idea.id,
		title: idea.title,
		description: idea.description,
		category: idea.category,
		status: idea.status,
		comment: idea.comment ?? null,
		attachment: idea.attachment ?? null,
		evaluationHistory: Array.isArray(idea.evaluationHistory) ? idea.evaluationHistory : [],
	};

	if (includeCreatorIdentity) {
		serialized.createdByUserId = idea.createdByUserId;
	}

	MASKED_IDENTITY_FIELDS.forEach((field) => {
		if (!includeCreatorIdentity) {
			delete serialized[field];
		}
	});

	return serialized;
}

function isDraftHiddenFromUser(idea, user) {
	return idea.status === 'draft' && String(idea.createdByUserId) !== String(user.id);
}

async function enrichEvaluationHistoryWithReviewer(historyEntries) {
	if (!Array.isArray(historyEntries) || historyEntries.length === 0) {
		return [];
	}

	const uniqueReviewerIds = [...new Set(historyEntries.map((entry) => String(entry.reviewerId || '')))].filter(Boolean);
	const reviewerPairs = await Promise.all(
		uniqueReviewerIds.map(async (reviewerId) => {
			const user = await userStore.findById(reviewerId);
			return [reviewerId, user?.email ?? null];
		}),
	);
	const reviewerEmailMap = new Map(reviewerPairs);

	return historyEntries.map((entry) => ({
		...entry,
		reviewerEmail: reviewerEmailMap.get(String(entry.reviewerId)) ?? null,
	}));
}

router.post('/', authMiddleware, singleIdeaAttachment, async (req, res) => {
	const validation = validateIdeaPayload(req.body || {});
	if (Object.keys(validation.fieldErrors).length > 0) {
		return res.status(400).json({
			error: 'Validation failed',
			fieldErrors: validation.fieldErrors,
		});
	}

	const requestedStatus = typeof req.body?.status === 'string' ? req.body.status.trim() : '';
	const createStatus = requestedStatus ? requestedStatus : 'submitted';

	if (!ALLOWED_CREATE_STATUSES.has(createStatus)) {
		return res.status(400).json({
			error: 'Validation failed',
			fieldErrors: {
				status: 'Status must be either draft or submitted.',
			},
		});
	}

	const idea = await ideaStore.createIdea({
		title: validation.normalized.title,
		description: validation.normalized.description,
		category: validation.normalized.category,
		status: createStatus,
		createdByUserId: req.user.id,
		attachment: buildAttachmentMetadata(req.file),
	});

	return res.status(201).json({
		id: idea.id,
		title: idea.title,
		description: idea.description,
		category: idea.category,
		status: idea.status,
	});
});

router.get('/', authMiddleware, async (req, res) => {
	const ideasRaw = await ideaStore.listIdeas();
	const ideas = ideasRaw
		.filter((idea) => !isDraftHiddenFromUser(idea, req.user))
		.map((idea) => serializeIdea(idea, {
			includeCreatorIdentity: shouldIncludeCreatorIdentity(req.user, idea),
		}));

	return res.status(200).json(ideas);
});

router.get('/:id', authMiddleware, async (req, res) => {
	const idea = await ideaStore.getIdeaById(req.params.id);

	if (!idea) {
		return res.status(404).json({ error: 'Not found' });
	}

	if (isDraftHiddenFromUser(idea, req.user)) {
		return res.status(404).json({ error: 'Not found' });
	}

	const serializedIdea = serializeIdea(idea, {
		includeCreatorIdentity: shouldIncludeCreatorIdentity(req.user, idea),
	});
	serializedIdea.evaluationHistory = await enrichEvaluationHistoryWithReviewer(serializedIdea.evaluationHistory);

	return res.status(200).json(serializedIdea);
});

router.get('/:id/attachment', authMiddleware, async (req, res) => {
	const idea = await ideaStore.getIdeaById(req.params.id);

	if (!idea) {
		return res.status(404).json({ error: 'Not found' });
	}

	if (isDraftHiddenFromUser(idea, req.user)) {
		return res.status(404).json({ error: 'Not found' });
	}

	if (!idea.attachment || !idea.attachment.storagePath) {
		return res.status(404).json({ error: 'Attachment not found' });
	}

	const attachmentPath = path.resolve(idea.attachment.storagePath);
	if (!fs.existsSync(attachmentPath)) {
		return res.status(404).json({ error: 'Attachment not found' });
	}

	const downloadName = idea.attachment.filename || path.basename(attachmentPath);
	res.setHeader('Content-Type', idea.attachment.mimeType || 'application/octet-stream');
	return res.download(attachmentPath, downloadName);
});

router.patch('/:id', authMiddleware, singleIdeaAttachment, async (req, res) => {
	const validation = validateIdeaPayload(req.body || {});
	if (Object.keys(validation.fieldErrors).length > 0) {
		return res.status(400).json({
			error: 'Validation failed',
			fieldErrors: validation.fieldErrors,
		});
	}

	const updatedIdea = await ideaStore.updateDraftByOwner({
		id: req.params.id,
		ownerUserId: req.user.id,
		title: validation.normalized.title,
		description: validation.normalized.description,
		category: validation.normalized.category,
		attachment: buildAttachmentMetadata(req.file),
	});

	if (!updatedIdea) {
		return res.status(404).json({ error: 'Not found' });
	}

	return res.status(200).json(serializeIdea(updatedIdea, {
		includeCreatorIdentity: shouldIncludeCreatorIdentity(req.user, updatedIdea),
	}));
});

router.put('/:id', authMiddleware, singleIdeaAttachment, async (req, res) => {
	const validation = validateIdeaPayload(req.body || {});
	if (Object.keys(validation.fieldErrors).length > 0) {
		return res.status(400).json({
			error: 'Validation failed',
			fieldErrors: validation.fieldErrors,
		});
	}

	const updatedIdea = await ideaStore.updateDraftByOwner({
		id: req.params.id,
		ownerUserId: req.user.id,
		title: validation.normalized.title,
		description: validation.normalized.description,
		category: validation.normalized.category,
		attachment: buildAttachmentMetadata(req.file),
	});

	if (!updatedIdea) {
		return res.status(404).json({ error: 'Not found' });
	}

	return res.status(200).json(serializeIdea(updatedIdea, {
		includeCreatorIdentity: shouldIncludeCreatorIdentity(req.user, updatedIdea),
	}));
});

router.patch('/:id/submit', authMiddleware, async (req, res) => {
	const submittedIdea = await ideaStore.submitDraftByOwner({
		id: req.params.id,
		ownerUserId: req.user.id,
	});

	if (!submittedIdea) {
		const idea = await ideaStore.getIdeaById(req.params.id);

		if (!idea || isDraftHiddenFromUser(idea, req.user)) {
			return res.status(404).json({ error: 'Not found' });
		}

		if (idea.status !== 'draft') {
			return res.status(400).json({ error: 'Only draft ideas can be submitted' });
		}

		return res.status(404).json({ error: 'Not found' });
	}

	return res.status(200).json(serializeIdea(submittedIdea, {
		includeCreatorIdentity: shouldIncludeCreatorIdentity(req.user, submittedIdea),
	}));
});

router.patch('/:id/status', authMiddleware, async (req, res) => {
	if (!req.user || req.user.role !== 'admin') {
		return res.status(403).json({ error: 'Forbidden' });
	}

	const { status, comment } = req.body || {};

	if (!ALLOWED_EVALUATION_STATUSES.has(status)) {
		return res.status(400).json({ error: 'Invalid status' });
	}

	if (comment !== undefined && comment !== null && typeof comment !== 'string') {
		return res.status(400).json({ error: 'Invalid comment' });
	}

	const existingIdea = await ideaStore.getIdeaById(req.params.id);
	if (!existingIdea) {
		return res.status(404).json({ error: 'Not found' });
	}

	const allowedNextStatuses = REVIEW_TRANSITIONS[existingIdea.status];
	if (!allowedNextStatuses || !allowedNextStatuses.has(status)) {
		return res.status(400).json({ error: 'Invalid transition' });
	}

	const nextComment = comment === undefined ? null : comment;
	const updateResult = await ideaStore.updateIdeaStatusWithHistory({
		id: req.params.id,
		status,
		comment: nextComment,
		reviewerId: req.user.id,
	});

	if (!updateResult) {
		return res.status(404).json({ error: 'Not found' });
	}

	const updatedIdea = updateResult.idea;

	return res.status(200).json({
		id: updatedIdea.id,
		status: updatedIdea.status,
		comment: updatedIdea.comment,
		historyEntry: updateResult.historyEntry,
	});
});

module.exports = router;
