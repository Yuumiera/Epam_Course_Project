const express = require('express');
const authMiddleware = require('../middlewares/auth');
const ideaStore = require('../store/ideaStore');

const router = express.Router();

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

module.exports = router;
