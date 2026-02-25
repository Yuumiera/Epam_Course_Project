let ideas = [];
let nextId = 1;

function createIdea({ title, description, category, status, createdByUserId }) {
	const idea = {
		id: String(nextId++),
		title,
		description,
		category,
		status,
		createdByUserId,
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

function reset() {
	ideas = [];
	nextId = 1;
}

module.exports = {
	createIdea,
	listIdeas,
	getIdeaById,
	reset,
};
