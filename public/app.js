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
const adminSection = document.getElementById('admin-evaluation');
const attachmentInputEl = document.getElementById('idea-attachment');
const chooseAttachmentButton = document.getElementById('choose-attachment');
const attachmentNameEl = document.getElementById('attachment-name');
const createIdeaFormEl = document.getElementById('create-idea-form');
const ideaTitleEl = document.getElementById('idea-title');
const ideaDescriptionEl = document.getElementById('idea-description');
const ideaCategoryEl = document.getElementById('idea-category');
const createIdeaSubmitEl = document.getElementById('create-idea-submit');
const titleFieldErrorEl = document.getElementById('idea-title-error');
const descriptionFieldErrorEl = document.getElementById('idea-description-error');
const categoryFieldErrorEl = document.getElementById('idea-category-error');

const TITLE_MIN_LENGTH = 3;
const TITLE_MAX_LENGTH = 120;
const DESCRIPTION_MIN_LENGTH = 20;
const DESCRIPTION_MAX_LENGTH = 2000;
const ALLOWED_IDEA_CATEGORIES = new Set(['HR', 'Process', 'Technology', 'Quality', 'Culture', 'Other']);
const MAX_ATTACHMENT_SIZE_MB = 500;
const MAX_ATTACHMENT_SIZE_BYTES = MAX_ATTACHMENT_SIZE_MB * 1024 * 1024;
const ALLOWED_ATTACHMENT_MIME_TYPES = new Set(['application/pdf', 'image/png', 'image/jpeg']);
let toastTimer = null;

function updateAttachmentNameLabel() {
  if (!attachmentNameEl || !attachmentInputEl) {
    return;
  }

  const file = attachmentInputEl.files && attachmentInputEl.files[0] ? attachmentInputEl.files[0] : null;
  attachmentNameEl.textContent = file ? file.name : 'No file chosen';
}

if (chooseAttachmentButton && attachmentInputEl) {
  chooseAttachmentButton.addEventListener('click', () => {
    attachmentInputEl.click();
  });

  attachmentInputEl.addEventListener('change', () => {
    updateAttachmentNameLabel();
  });
}

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
      if (error.message === 'Failed to fetch') {
        return 'Server unreachable. Make sure the backend is running on port 3000.';
      }
      return error.message;
    }
  }

  return 'Something went wrong. Please try again.';
}

function validateCreateIdeaFields(values) {
  const errors = {};
  const title = String(values.title || '').trim();
  const description = String(values.description || '').trim();
  const category = String(values.category || '').trim();

  if (title.length < TITLE_MIN_LENGTH || title.length > TITLE_MAX_LENGTH) {
    errors.title = `Title must be between ${TITLE_MIN_LENGTH} and ${TITLE_MAX_LENGTH} characters.`;
  }

  if (description.length < DESCRIPTION_MIN_LENGTH || description.length > DESCRIPTION_MAX_LENGTH) {
    errors.description = `Description must be between ${DESCRIPTION_MIN_LENGTH} and ${DESCRIPTION_MAX_LENGTH} characters.`;
  }

  if (!ALLOWED_IDEA_CATEGORIES.has(category)) {
    errors.category = 'Category is invalid.';
  }

  return errors;
}

function setCreateIdeaFieldErrors(errors) {
  if (titleFieldErrorEl) {
    titleFieldErrorEl.textContent = errors.title || '';
  }
  if (descriptionFieldErrorEl) {
    descriptionFieldErrorEl.textContent = errors.description || '';
  }
  if (categoryFieldErrorEl) {
    categoryFieldErrorEl.textContent = errors.category || '';
  }
}

function updateCreateIdeaSubmitState() {
  if (!createIdeaSubmitEl || !ideaTitleEl || !ideaDescriptionEl || !ideaCategoryEl) {
    return;
  }

  const errors = validateCreateIdeaFields({
    title: ideaTitleEl.value,
    description: ideaDescriptionEl.value,
    category: ideaCategoryEl.value,
  });

  setCreateIdeaFieldErrors(errors);
  createIdeaSubmitEl.disabled = Object.keys(errors).length > 0;
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
  let rawText = '';

  try {
    rawText = await response.text();
  } catch (error) {
    rawText = '';
  }

  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch (error) {
      data = null;
    }
  }

  if (!response.ok) {
    const fallbackMessage = rawText || response.statusText || 'Request failed';
    const errorMessage = data?.error || `Request failed (${response.status}): ${fallbackMessage}`;
    throw {
      status: response.status,
      data,
      message: errorMessage,
    };
  }

  return data;
}

function clearSelection() {
  selectedIdeaId = null;
  ideaDetailEl.className = 'idea-detail-empty';
  ideaDetailEl.textContent = 'Select an idea from the list.';
}

async function openAttachment(ideaId, attachmentName, mimeType) {
  try {
    const response = await fetch(`/ideas/${ideaId}/attachment`, {
      method: 'GET',
      headers: authHeaders(false),
    });

    if (!response.ok) {
      let data = null;
      try {
        data = await response.json();
      } catch (error) {
        data = null;
      }

      throw {
        status: response.status,
        data,
        message: data?.error || 'Attachment request failed',
      };
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    if (mimeType === 'application/pdf') {
      window.open(objectUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(objectUrl), 30000);
      return;
    }

    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = attachmentName || 'attachment';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  } catch (error) {
    showToast(readableError(error), 'error');
  }
}

function renderIdeaDetail(detail) {
  const safeComment = detail.comment === null || detail.comment === undefined || detail.comment === ''
    ? 'No evaluation comment yet.'
    : detail.comment;
  const attachmentName = detail.attachment?.filename || detail.attachment?.originalName || 'Unknown file';
  const attachmentType = detail.attachment?.mimeType || detail.attachment?.type || 'unknown/type';
  const attachmentSize = detail.attachment?.sizeBytes ?? detail.attachment?.size ?? 'unknown';
  const attachmentHtml = detail.attachment
    ? `
    <div>
      <span class="detail-label">Attachment</span>
      <p class="detail-text">
        <button type="button" class="attachment-link" data-download-id="${detail.id}" data-download-name="${attachmentName}" data-download-mime="${attachmentType}">${attachmentName}</button><br>
        <small>${attachmentType} • ${attachmentSize} bytes</small>
      </p>
    </div>
  `
    : `
    <div>
      <span class="detail-label">Attachment</span>
      <p class="detail-text">No attachment uploaded.</p>
    </div>
  `;

  ideaDetailEl.className = 'idea-detail-card';
  ideaDetailEl.innerHTML = `
    <div class="detail-head">
      <h4>${detail.title}</h4>
      <span class="status-pill ${statusClass(detail.status)}">${detail.status}</span>
    </div>
    <div><span class="detail-label">Category</span><p>${detail.category}</p></div>
    <div>
      <span class="detail-label">Description</span>
      <p class="detail-text">${detail.description}</p>
    </div>
    <div>
      <span class="detail-label">Evaluation Comment</span>
      <p class="detail-text">${safeComment}</p>
    </div>
    ${attachmentHtml}
  `;

  const attachmentButton = ideaDetailEl.querySelector('.attachment-link');
  if (attachmentButton) {
    attachmentButton.addEventListener('click', () => {
      const ideaId = attachmentButton.dataset.downloadId;
      const name = attachmentButton.dataset.downloadName;
      const mime = attachmentButton.dataset.downloadMime;
      openAttachment(ideaId, name, mime);
    });
  }
}

function setSelectedIdea(ideaId) {
  selectedIdeaId = ideaId;

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
    const attachmentTag = idea.attachment
      ? '<span class="attachment-flag">Attachment</span>'
      : '';
    button.innerHTML = `<strong>${truncate(idea.title)}</strong><span><span class="status-pill ${statusClass(idea.status)}">${idea.status}</span>${attachmentTag}</span>`;

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

createIdeaFormEl.addEventListener('submit', async (event) => {
  event.preventDefault();

  const title = ideaTitleEl.value.trim();
  const description = ideaDescriptionEl.value.trim();
  const category = ideaCategoryEl.value.trim();
  const attachmentInput = attachmentInputEl;
  const file = attachmentInput.files && attachmentInput.files[0] ? attachmentInput.files[0] : null;

  const clientErrors = validateCreateIdeaFields({ title, description, category });
  if (Object.keys(clientErrors).length > 0) {
    setCreateIdeaFieldErrors(clientErrors);
    createIdeaSubmitEl.disabled = true;
    showToast('Please correct the highlighted fields.', 'error');
    return;
  }

  if (file && !ALLOWED_ATTACHMENT_MIME_TYPES.has(file.type)) {
    showToast('Attachment type must be PDF, PNG, or JPG.', 'error');
    return;
  }

  if (file && file.size > MAX_ATTACHMENT_SIZE_BYTES) {
    showToast(`Attachment must be ${MAX_ATTACHMENT_SIZE_MB}MB or smaller.`, 'error');
    return;
  }

  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description);
  formData.append('category', category);
  if (file) {
    formData.append('attachment', file);
  }

  try {
    const idea = await apiFetch('/ideas', {
      method: 'POST',
      headers: authHeaders(false),
      body: formData,
    });

    await loadIdeas();
    setSelectedIdea(idea.id);
    await loadIdeaDetail(idea.id);
    showToast('Idea created successfully.', 'success');
    event.target.reset();
    setCreateIdeaFieldErrors({});
    updateAttachmentNameLabel();
    updateCreateIdeaSubmitState();
  } catch (error) {
    if (error?.status === 401) {
      clearSession();
      showAuthView();
      showToast('Session expired. Please sign in again.', 'error');
      return;
    }

    if (error?.data?.fieldErrors && typeof error.data.fieldErrors === 'object') {
      setCreateIdeaFieldErrors(error.data.fieldErrors);
      updateCreateIdeaSubmitState();
      const inlineMessages = Object.values(error.data.fieldErrors).filter(Boolean);
      if (inlineMessages.length > 0) {
        showToast(inlineMessages[0], 'error');
        return;
      }
    }

    showToast(readableError(error), 'error');
  }
});

[ideaTitleEl, ideaDescriptionEl, ideaCategoryEl].forEach((element) => {
  if (!element) {
    return;
  }
  element.addEventListener('input', updateCreateIdeaSubmitState);
  element.addEventListener('change', updateCreateIdeaSubmitState);
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
updateCreateIdeaSubmitState();
