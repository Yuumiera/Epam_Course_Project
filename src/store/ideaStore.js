let ideas = [];
let nextId = 1;

function createIdea({ title, description, category, status, createdByUserId, attachment = null }) {
	const idea = {
		id: String(nextId++),
		title,
		description,
		category,
		status,
		createdByUserId,
		attachment,
	};

	ideas.push(idea);
	return idea;
}

function listIdeas() {
	return ideas;
}

function getIdeaById(id) {
	return ideas.find((idea) => idea.id === String(id)) || null;
}

function updateIdeaStatus(id, status, comment) {
	const idea = ideas.find((item) => item.id === String(id));

	if (!idea) {
		return null;
	}

	idea.status = status;
	idea.comment = comment;

	return idea;
}

function reset() {
	ideas = [];
	nextId = 1;
}

module.exports = {
	createIdea,
	listIdeas,
	getIdeaById,
	updateIdeaStatus,
	reset,
};
