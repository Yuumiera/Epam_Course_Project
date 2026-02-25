const TOKEN_KEY = 'portal_token';
const EMAIL_KEY = 'portal_email';

let token = null;
let currentUser = {
  role: null,
  email: null,
};
let selectedIdeaId = null;
let ideasCache = [];

const authView = document.getElementById('auth-view');
const appView = document.getElementById('app-view');
const registerPanel = document.getElementById('register-panel');
const openRegisterButton = document.getElementById('open-register');
const closeRegisterButton = document.getElementById('close-register');
const toastEl = document.getElementById('toast');
const roleChip = document.getElementById('role-chip');
const emailChip = document.getElementById('email-chip');
const ideasListEl = document.getElementById('ideas-list');
const ideaDetailEl = document.getElementById('idea-detail');
const selectedIdEl = document.getElementById('selected-id');
const adminSection = document.getElementById('admin-evaluation');
let toastTimer = null;

function showToast(text, type = 'info') {
  if (toastTimer) {
    clearTimeout(toastTimer);
  }

  toastEl.textContent = text;
  toastEl.classList.remove('hidden', 'info', 'success', 'error');
  toastEl.classList.add(type);

  toastTimer = setTimeout(() => {
    toastEl.classList.add('hidden');
  }, 2800);
}

function statusClass(status) {
  if (!status) {
    return 'status-submitted';
  }

  return `status-${String(status).toLowerCase()}`;
}

function truncate(value, maxLength = 45) {
  const text = String(value || '');
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1)}…`;
}

function readableError(error) {
  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object') {
    const maybeData = error.data;
    const statusPrefix = error.status ? `Request failed (${error.status}). ` : '';

    if (maybeData && typeof maybeData.error === 'string') {
      return `${statusPrefix}${maybeData.error}`.trim();
    }

    if (error.message) {
      return error.message;
    }
  }

  return 'Something went wrong. Please try again.';
}

function parseJwtPayload(jwt) {
  try {
    const payload = jwt.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const normalized = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(normalized));
  } catch (error) {
    return null;
  }
}

function authHeaders(includeJson = true) {
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (includeJson) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

async function apiFetch(url, options = {}) {
  const response = await fetch(url, options);
  let data = null;

  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  if (!response.ok) {
    throw {
      status: response.status,
      data,
      message: data?.error || 'Request failed',
    };
  }

  return data;
}

function clearSelection() {
  selectedIdeaId = null;
  selectedIdEl.textContent = 'Selected ID: none';
  ideaDetailEl.className = 'idea-detail-empty';
  ideaDetailEl.textContent = 'Select an idea from the list.';
}

function renderIdeaDetail(detail) {
  const safeComment = detail.comment === null || detail.comment === undefined || detail.comment === ''
    ? 'No evaluation comment yet.'
    : detail.comment;

  ideaDetailEl.className = 'idea-detail-card';
  ideaDetailEl.innerHTML = `
    <div class="detail-head">
      <h4>${detail.title}</h4>
      <span class="status-pill ${statusClass(detail.status)}">${detail.status}</span>
    </div>
    <div class="detail-grid">
      <div><span class="detail-label">Idea ID</span><p>${detail.id}</p></div>
      <div><span class="detail-label">Category</span><p>${detail.category}</p></div>
    </div>
    <div>
      <span class="detail-label">Description</span>
      <p class="detail-text">${detail.description}</p>
    </div>
    <div>
      <span class="detail-label">Evaluation Comment</span>
      <p class="detail-text">${safeComment}</p>
    </div>
  `;
}

function setSelectedIdea(ideaId) {
  selectedIdeaId = ideaId;
  selectedIdEl.textContent = `Selected ID: ${ideaId}`;

  const buttons = document.querySelectorAll('.idea-item');
  buttons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.ideaId === ideaId);
  });
}

function renderIdeas() {
  ideasListEl.innerHTML = '';

  if (!ideasCache.length) {
    const item = document.createElement('li');
    item.className = 'empty-state';
    item.textContent = 'No ideas yet.';
    ideasListEl.appendChild(item);
    clearSelection();
    return;
  }

  ideasCache.forEach((idea) => {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'idea-item';
    button.dataset.ideaId = idea.id;
    button.innerHTML = `<strong>${truncate(idea.title)}</strong><span>#${idea.id}<span class="status-pill ${statusClass(idea.status)}">${idea.status}</span></span>`;

    button.addEventListener('click', async () => {
      setSelectedIdea(idea.id);
      await loadIdeaDetail(idea.id);
    });

    li.appendChild(button);
    ideasListEl.appendChild(li);
  });

  if (selectedIdeaId) {
    setSelectedIdea(selectedIdeaId);
  }
}

function setSession(nextToken, emailHint) {
  token = nextToken;

  const payload = parseJwtPayload(nextToken) || {};
  currentUser.role = payload.role || 'submitter';
  currentUser.email = payload.email || emailHint || localStorage.getItem(EMAIL_KEY) || 'unknown';

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EMAIL_KEY, currentUser.email);

  roleChip.textContent = `Role: ${currentUser.role}`;
  emailChip.textContent = `Email: ${currentUser.email}`;
  adminSection.classList.toggle('hidden', currentUser.role !== 'admin');
}

function clearSession() {
  token = null;
  currentUser = { role: null, email: null };
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMAIL_KEY);
  roleChip.textContent = 'Role: -';
  emailChip.textContent = 'Email: -';
  adminSection.classList.add('hidden');
}

function showAuthView() {
  authView.classList.remove('hidden');
  appView.classList.add('hidden');
  clearSelection();
}

function showAppView() {
  authView.classList.add('hidden');
  appView.classList.remove('hidden');
}

async function loadIdeas() {
  const ideas = await apiFetch('/ideas', {
    method: 'GET',
    headers: authHeaders(false),
  });

  ideasCache = Array.isArray(ideas) ? ideas : [];
  renderIdeas();
}

async function loadIdeaDetail(ideaId) {
  try {
    const detail = await apiFetch(`/ideas/${ideaId}`, {
      method: 'GET',
      headers: authHeaders(false),
    });

    renderIdeaDetail(detail);
    showToast(`Idea #${ideaId} loaded.`, 'info');
  } catch (error) {
    ideaDetailEl.className = 'idea-detail-empty';
    ideaDetailEl.textContent = 'Unable to load idea detail.';
    showToast(readableError(error), 'error');
  }
}

openRegisterButton.addEventListener('click', () => {
  registerPanel.classList.remove('hidden');
  openRegisterButton.classList.add('hidden');
});

closeRegisterButton.addEventListener('click', () => {
  registerPanel.classList.add('hidden');
  openRegisterButton.classList.remove('hidden');
});

document.getElementById('register-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  const role = document.getElementById('register-role').value;

  try {
    await apiFetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
    showToast('Registration successful. You can now sign in.', 'success');
    registerPanel.classList.add('hidden');
    openRegisterButton.classList.remove('hidden');
    event.target.reset();
  } catch (error) {
    showToast(readableError(error), 'error');
  }
});

document.getElementById('login-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    setSession(data.token, email);
    showAppView();
    await loadIdeas();
    showToast('Signed in successfully.', 'success');
  } catch (error) {
    clearSession();
    showAuthView();
    showToast(readableError(error), 'error');
  }
});

document.getElementById('logout-btn').addEventListener('click', () => {
  clearSession();
  showAuthView();
  showToast('Signed out successfully.', 'success');
});

document.getElementById('create-idea-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const title = document.getElementById('idea-title').value.trim();
  const description = document.getElementById('idea-description').value.trim();
  const category = document.getElementById('idea-category').value.trim();

  try {
    const idea = await apiFetch('/ideas', {
      method: 'POST',
      headers: authHeaders(true),
      body: JSON.stringify({ title, description, category }),
    });

    await loadIdeas();
    setSelectedIdea(idea.id);
    await loadIdeaDetail(idea.id);
    showToast('Idea created successfully.', 'success');
    event.target.reset();
  } catch (error) {
    showToast(readableError(error), 'error');
  }
});

document.getElementById('refresh-ideas').addEventListener('click', async () => {
  try {
    await loadIdeas();
    showToast('Ideas list refreshed.', 'success');
  } catch (error) {
    showToast(readableError(error), 'error');
  }
});

document.getElementById('evaluate-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!selectedIdeaId) {
    showToast('Select an idea before submitting evaluation.', 'error');
    return;
  }

  const status = document.getElementById('eval-status').value;
  const commentText = document.getElementById('eval-comment').value;

  const body = { status };
  if (commentText !== '') {
    body.comment = commentText;
  }

  try {
    await apiFetch(`/ideas/${selectedIdeaId}/status`, {
      method: 'PATCH',
      headers: authHeaders(true),
      body: JSON.stringify(body),
    });

    await loadIdeas();
    await loadIdeaDetail(selectedIdeaId);
    showToast('Evaluation updated successfully.', 'success');
    event.target.reset();
  } catch (error) {
    showToast(readableError(error), 'error');
  }
});

function bootstrap() {
  showAuthView();

  const storedToken = localStorage.getItem(TOKEN_KEY);
  const storedEmail = localStorage.getItem(EMAIL_KEY);

  if (!storedToken) {
    return;
  }

  const payload = parseJwtPayload(storedToken);
  if (!payload || !payload.role) {
    clearSession();
    return;
  }

  setSession(storedToken, payload.email || storedEmail);
  showAppView();
  loadIdeas().catch((error) => {
    showToast(readableError(error), 'error');
    if (error.status === 401) {
      clearSession();
      showAuthView();
      showToast('Session expired. Please sign in again.', 'error');
    }
  });
}

bootstrap();
