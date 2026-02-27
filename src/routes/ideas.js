const express = require('express');
const fs = require('fs');
const path = require('path');
const authMiddleware = require('../middlewares/auth');
const { singleIdeaAttachment } = require('../middlewares/upload');
const ideaStore = require('../store/ideaStore');

const router = express.Router();
const ALLOWED_EVALUATION_STATUSES = new Set(['under_review', 'accepted', 'rejected']);
const ALLOWED_IDEA_CATEGORIES = new Set(['HR', 'Process', 'Technology', 'Quality', 'Culture', 'Other']);
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

router.post('/', authMiddleware, singleIdeaAttachment, async (req, res) => {
	const validation = validateIdeaPayload(req.body || {});
	if (Object.keys(validation.fieldErrors).length > 0) {
		return res.status(400).json({
			error: 'Validation failed',
			fieldErrors: validation.fieldErrors,
		});
	}

	const idea = await ideaStore.createIdea({
		title: validation.normalized.title,
		description: validation.normalized.description,
		category: validation.normalized.category,
		status: 'submitted',
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
	const ideas = ideasRaw.map((idea) => ({
		id: idea.id,
		title: idea.title,
		description: idea.description,
		category: idea.category,
		status: idea.status,
		comment: idea.comment ?? null,
		attachment: idea.attachment ?? null,
	}));

	return res.status(200).json(ideas);
});

router.get('/:id', authMiddleware, async (req, res) => {
	const idea = await ideaStore.getIdeaById(req.params.id);

	if (!idea) {
		return res.status(404).json({ error: 'Not found' });
	}

	return res.status(200).json({
		id: idea.id,
		title: idea.title,
		description: idea.description,
		category: idea.category,
		status: idea.status,
		comment: idea.comment ?? null,
		attachment: idea.attachment ?? null,
	});
});

router.get('/:id/attachment', authMiddleware, async (req, res) => {
	const idea = await ideaStore.getIdeaById(req.params.id);

	if (!idea) {
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

	const nextComment = comment === undefined ? null : comment;
	const updatedIdea = await ideaStore.updateIdeaStatus(req.params.id, status, nextComment);

	if (!updatedIdea) {
		return res.status(404).json({ error: 'Not found' });
	}

	return res.status(200).json({
		id: updatedIdea.id,
		status: updatedIdea.status,
		comment: updatedIdea.comment,
	});
});

module.exports = router;
