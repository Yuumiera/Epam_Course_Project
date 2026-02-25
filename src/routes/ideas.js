const express = require('express');
const authMiddleware = require('../middlewares/auth');
const ideaStore = require('../store/ideaStore');

const router = express.Router();
const ALLOWED_EVALUATION_STATUSES = new Set(['under_review', 'accepted', 'rejected']);

function isNonEmptyString(value) {
	return typeof value === 'string' && value.trim().length > 0;
}

router.post('/', authMiddleware, (req, res) => {
	const { title, description, category } = req.body || {};

	if (!isNonEmptyString(title) || !isNonEmptyString(description) || !isNonEmptyString(category)) {
		return res.status(400).json({ error: 'Invalid payload' });
	}

	const idea = ideaStore.createIdea({
		title,
		description,
		category,
		status: 'submitted',
		createdByUserId: req.user.id,
	});

	return res.status(201).json({
		id: idea.id,
		title: idea.title,
		description: idea.description,
		category: idea.category,
		status: idea.status,
	});
});

router.get('/', authMiddleware, (req, res) => {
	const ideas = ideaStore.listIdeas().map((idea) => ({
		id: idea.id,
		title: idea.title,
		description: idea.description,
		category: idea.category,
		status: idea.status,
	}));

	return res.status(200).json(ideas);
});

router.get('/:id', authMiddleware, (req, res) => {
	const idea = ideaStore.getIdeaById(req.params.id);

	if (!idea) {
		return res.status(404).json({ error: 'Not found' });
	}

	return res.status(200).json({
		id: idea.id,
		title: idea.title,
		description: idea.description,
		category: idea.category,
		status: idea.status,
	});
});

router.patch('/:id/status', authMiddleware, (req, res) => {
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
	const updatedIdea = ideaStore.updateIdeaStatus(req.params.id, status, nextComment);

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
