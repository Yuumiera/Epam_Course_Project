const TOKEN_KEY = 'portal_token';
const EMAIL_KEY = 'portal_email';
const DISPLAY_NAME_KEY = 'portal_display_name';

let token = null;
let currentUser = {
  role: null,
  email: null,
  displayName: null,
};
let selectedIdeaId = null;
let ideasCache = [];

const authView = document.getElementById('auth-view');
const appView = document.getElementById('app-view');
const registerPanel = document.getElementById('register-panel');
const openRegisterButton = document.getElementById('open-register');
const closeRegisterButton = document.getElementById('close-register');
const registerDisplayNameEl = document.getElementById('register-display-name');
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
const createIdeaDraftEl = document.getElementById('create-idea-draft');
const titleFieldErrorEl = document.getElementById('idea-title-error');
const descriptionFieldErrorEl = document.getElementById('idea-description-error');
const categoryFieldErrorEl = document.getElementById('idea-category-error');
const scoreFormEl = document.getElementById('score-form');
const scoreImpactEl = document.getElementById('score-impact');
const scoreFeasibilityEl = document.getElementById('score-feasibility');
const scoreInnovationEl = document.getElementById('score-innovation');
const scoreStarGroups = Array.from(document.querySelectorAll('.star-group'));
const dashboardTabButtons = Array.from(document.querySelectorAll('[data-dashboard-tab]'));
const dashboardPages = Array.from(document.querySelectorAll('[data-dashboard-page]'));
const quickSectionButtons = Array.from(document.querySelectorAll('[data-jump-section]'));
const refreshOverviewButtonEl = document.getElementById('refresh-overview');
const metricTotalEl = document.getElementById('metric-total');
const metricDraftEl = document.getElementById('metric-draft');
const metricAcceptedEl = document.getElementById('metric-accepted');
const metricScoredEl = document.getElementById('metric-scored');
const profileEmailEl = document.getElementById('profile-email');
const profileRoleEl = document.getElementById('profile-role');
const profileSessionEl = document.getElementById('profile-session');
const profileNameEl = document.getElementById('profile-name');

const TITLE_MIN_LENGTH = 3;
const TITLE_MAX_LENGTH = 120;
const DESCRIPTION_MIN_LENGTH = 20;
const DESCRIPTION_MAX_LENGTH = 2000;
const ALLOWED_IDEA_CATEGORIES = new Set(['HR', 'Process', 'Technology', 'Quality', 'Culture', 'Other']);
const MAX_ATTACHMENT_SIZE_MB = 500;
const MAX_ATTACHMENT_SIZE_BYTES = MAX_ATTACHMENT_SIZE_MB * 1024 * 1024;
const ALLOWED_ATTACHMENT_MIME_TYPES = new Set(['application/pdf', 'image/png', 'image/jpeg']);
const REVIEW_TRANSITIONS = {
  submitted: ['under_review'],
  under_review: ['approved_for_final'],
  approved_for_final: ['accepted', 'rejected'],
};
let toastTimer = null;
let pendingCreateStatus = 'submitted';
let activeDashboardSection = 'overview';

function getCurrentPage() {
  const path = window.location.pathname;
  if (path === '/register') {
    return 'register';
  }
  if (path === '/profile') {
    return 'profile';
  }
  if (path === '/dashboard') {
    return 'dashboard';
  }
  return 'login';
}

function navigateTo(path) {
  if (window.location.pathname !== path) {
    window.location.assign(path);
  }
}

function goToDashboardSection(sectionName) {
  sessionStorage.setItem('dashboard_section', sectionName);
  navigateTo('/dashboard');
}

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
  if (!toastEl) {
    return;
  }

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
  if (!createIdeaSubmitEl || !createIdeaDraftEl || !ideaTitleEl || !ideaDescriptionEl || !ideaCategoryEl) {
    return;
  }

  const errors = validateCreateIdeaFields({
    title: ideaTitleEl.value,
    description: ideaDescriptionEl.value,
    category: ideaCategoryEl.value,
  });

  setCreateIdeaFieldErrors(errors);
  const hasErrors = Object.keys(errors).length > 0;
  createIdeaSubmitEl.disabled = hasErrors;
  createIdeaDraftEl.disabled = hasErrors;
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

function updateDashboardStats() {
  const total = ideasCache.length;
  const draftCount = ideasCache.filter((idea) => idea.status === 'draft').length;
  const acceptedCount = ideasCache.filter((idea) => idea.status === 'accepted').length;
  const scoredCount = ideasCache.filter((idea) => Number.isFinite(idea.totalScore)).length;

  if (metricTotalEl) {
    metricTotalEl.textContent = String(total);
  }
  if (metricDraftEl) {
    metricDraftEl.textContent = String(draftCount);
  }
  if (metricAcceptedEl) {
    metricAcceptedEl.textContent = String(acceptedCount);
  }
  if (metricScoredEl) {
    metricScoredEl.textContent = String(scoredCount);
  }
}

function renderScoreStars(scoreValue) {
  const parsed = Number(scoreValue);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
    return '☆☆☆☆☆';
  }

  return `${'★'.repeat(parsed)}${'☆'.repeat(5 - parsed)}`;
}

function setScoreFieldValue(fieldName, value) {
  const mappedInputs = {
    impact: scoreImpactEl,
    feasibility: scoreFeasibilityEl,
    innovation: scoreInnovationEl,
  };

  const inputEl = mappedInputs[fieldName];
  if (inputEl) {
    inputEl.value = String(value);
  }

  const groupEl = scoreStarGroups.find((group) => group.dataset.scoreField === fieldName);
  if (!groupEl) {
    return;
  }

  const selectedValue = Number(value);
  const starButtons = Array.from(groupEl.querySelectorAll('.star-btn'));
  starButtons.forEach((button) => {
    const buttonValue = Number(button.dataset.scoreValue);
    button.classList.toggle('active', buttonValue <= selectedValue);
  });
}

function initStarScoreControls() {
  scoreStarGroups.forEach((groupEl) => {
    const fieldName = groupEl.dataset.scoreField;
    const starButtons = Array.from(groupEl.querySelectorAll('.star-btn'));

    starButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const value = Number(button.dataset.scoreValue);
        setScoreFieldValue(fieldName, value);
      });
    });
  });
}

function setDashboardSection(sectionName) {
  if (!dashboardPages.length || !dashboardTabButtons.length) {
    return;
  }

  const adminVisible = currentUser.role === 'admin';
  const resolvedSection = sectionName === 'admin' && !adminVisible ? 'overview' : sectionName;
  activeDashboardSection = resolvedSection;

  dashboardPages.forEach((page) => {
    page.classList.toggle('hidden', page.dataset.dashboardPage !== resolvedSection);
  });

  dashboardTabButtons.forEach((button) => {
    const buttonSection = button.dataset.dashboardTab;
    const isAdminButton = buttonSection === 'admin';
    if (isAdminButton) {
      button.classList.toggle('hidden', !adminVisible);
    }
    button.classList.toggle('active', buttonSection === resolvedSection);
  });
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
  if (!ideaDetailEl) {
    return;
  }
  ideaDetailEl.className = 'idea-detail-empty';
  ideaDetailEl.textContent = 'Select an idea from the list.';

  const evalStatusEl = document.getElementById('eval-status');
  if (evalStatusEl) {
    evalStatusEl.innerHTML = '<option value="">Select an idea first</option>';
    evalStatusEl.disabled = true;
  }
}

function updateEvaluationStatusOptions(currentStatus) {
  const evalStatusEl = document.getElementById('eval-status');
  if (!evalStatusEl) {
    return;
  }

  const nextStatuses = REVIEW_TRANSITIONS[currentStatus] || [];
  evalStatusEl.innerHTML = '';

  if (!nextStatuses.length) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'No further transitions available';
    evalStatusEl.appendChild(option);
    evalStatusEl.disabled = true;
    return;
  }

  nextStatuses.forEach((status) => {
    const option = document.createElement('option');
    option.value = status;
    option.textContent = status;
    evalStatusEl.appendChild(option);
  });

  evalStatusEl.disabled = false;
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

async function updateDraftIdea(ideaId, values) {
  return apiFetch(`/ideas/${ideaId}`, {
    method: 'PATCH',
    headers: authHeaders(true),
    body: JSON.stringify(values),
  });
}

async function submitDraftIdea(ideaId) {
  return apiFetch(`/ideas/${ideaId}/submit`, {
    method: 'PATCH',
    headers: authHeaders(false),
  });
}

async function updateIdeaScore(ideaId, values) {
  return apiFetch(`/ideas/${ideaId}/score`, {
    method: 'PATCH',
    headers: authHeaders(true),
    body: JSON.stringify(values),
  });
}

function renderIdeaDetail(detail) {
  updateEvaluationStatusOptions(detail.status);

  const hasTotalScore = Number.isFinite(detail.totalScore);
  const totalScoreLabel = hasTotalScore ? Number(detail.totalScore).toFixed(2) : 'Unscored';

  const safeComment = detail.comment === null || detail.comment === undefined || detail.comment === ''
    ? 'No evaluation comment yet.'
    : detail.comment;
  const evaluationHistory = Array.isArray(detail.evaluationHistory) ? detail.evaluationHistory : [];
  const attachmentName = detail.attachment?.filename || detail.attachment?.originalName || 'Unknown file';
  const attachmentType = detail.attachment?.mimeType || detail.attachment?.type || 'unknown/type';
  const attachmentSize = detail.attachment?.sizeBytes ?? detail.attachment?.size ?? 'unknown';
  const timelineHtml = evaluationHistory.length > 0
    ? `
  <div class="timeline-list">
    ${evaluationHistory.map((entry) => `
      <div class="timeline-item">
        <div class="timeline-head">
          <span class="status-pill ${statusClass(entry.status)}">${entry.status}</span>
          <small>${new Date(entry.timestamp).toLocaleString()}</small>
        </div>
        <p class="detail-text"><strong>Reviewer:</strong> ${entry.reviewerEmail || entry.reviewerId}</p>
        <p class="detail-text"><strong>Comment:</strong> ${entry.comment || 'No comment'}</p>
      </div>
    `).join('')}
  </div>
  `
    : '<p class="detail-text">No review history yet.</p>';
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
  const draftActionsHtml = detail.status === 'draft'
    ? `
    <div class="draft-actions">
      <button type="button" id="edit-draft-btn" class="ghost">Edit Draft</button>
      <button type="button" id="submit-draft-btn">Submit Draft</button>
    </div>
    <form id="draft-edit-form" class="stack hidden draft-edit-form">
      <label for="draft-title">Title</label>
      <input id="draft-title" type="text" value="${detail.title}" required />

      <label for="draft-description">Description</label>
      <textarea id="draft-description" rows="4" required>${detail.description}</textarea>

      <label for="draft-category">Category</label>
      <select id="draft-category" required>
        <option value="HR" ${detail.category === 'HR' ? 'selected' : ''}>HR</option>
        <option value="Process" ${detail.category === 'Process' ? 'selected' : ''}>Process</option>
        <option value="Technology" ${detail.category === 'Technology' ? 'selected' : ''}>Technology</option>
        <option value="Quality" ${detail.category === 'Quality' ? 'selected' : ''}>Quality</option>
        <option value="Culture" ${detail.category === 'Culture' ? 'selected' : ''}>Culture</option>
        <option value="Other" ${detail.category === 'Other' ? 'selected' : ''}>Other</option>
      </select>

      <div class="row draft-form-actions">
        <button type="submit">Save Draft Changes</button>
        <button type="button" id="cancel-draft-edit" class="ghost">Cancel</button>
      </div>
    </form>
  `
    : '';
  const ownerIdentityHtml = detail.createdByUserId
    ? `
    <div>
      <span class="detail-label">Owner</span>
      <p class="detail-text">${currentUser.email || 'You'}</p>
    </div>
  `
    : '';

  const scoreBreakdownHtml = hasTotalScore
    ? `
    <div class="score-breakdown">
      <span class="detail-label">Score Breakdown</span>
      <p class="detail-text">Impact: ${renderScoreStars(detail.impactScore)} (${detail.impactScore}) • Feasibility: ${renderScoreStars(detail.feasibilityScore)} (${detail.feasibilityScore}) • Innovation: ${renderScoreStars(detail.innovationScore)} (${detail.innovationScore})</p>
      <p class="detail-text"><strong>Total Score:</strong> ${totalScoreLabel}${Number.isInteger(detail.rank) ? ` • Rank: #${detail.rank}` : ''}</p>
    </div>
  `
    : `
    <div class="score-breakdown">
      <span class="detail-label">Score Breakdown</span>
      <p class="detail-text">Not scored yet.</p>
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
    <div>
      <span class="detail-label">Review History</span>
      ${timelineHtml}
    </div>
    ${scoreBreakdownHtml}
    ${ownerIdentityHtml}
    ${attachmentHtml}
    ${draftActionsHtml}
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

  const editDraftButton = ideaDetailEl.querySelector('#edit-draft-btn');
  const submitDraftButton = ideaDetailEl.querySelector('#submit-draft-btn');
  const draftEditForm = ideaDetailEl.querySelector('#draft-edit-form');
  const cancelDraftEditButton = ideaDetailEl.querySelector('#cancel-draft-edit');

  if (editDraftButton && draftEditForm) {
    editDraftButton.addEventListener('click', () => {
      draftEditForm.classList.toggle('hidden');
    });
  }

  if (cancelDraftEditButton && draftEditForm) {
    cancelDraftEditButton.addEventListener('click', () => {
      draftEditForm.classList.add('hidden');
    });
  }

  if (draftEditForm) {
    draftEditForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const title = document.getElementById('draft-title').value.trim();
      const description = document.getElementById('draft-description').value.trim();
      const category = document.getElementById('draft-category').value.trim();

      const clientErrors = validateCreateIdeaFields({ title, description, category });
      if (Object.keys(clientErrors).length > 0) {
        const firstError = clientErrors.title || clientErrors.description || clientErrors.category;
        showToast(firstError, 'error');
        return;
      }

      try {
        await updateDraftIdea(detail.id, { title, description, category });
        await loadIdeas();
        await loadIdeaDetail(detail.id);
        showToast('Draft updated successfully.', 'success');
      } catch (error) {
        showToast(readableError(error), 'error');
      }
    });
  }

  if (submitDraftButton) {
    submitDraftButton.addEventListener('click', async () => {
      try {
        await submitDraftIdea(detail.id);
        await loadIdeas();
        await loadIdeaDetail(detail.id);
        showToast('Draft submitted successfully.', 'success');
      } catch (error) {
        showToast(readableError(error), 'error');
      }
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
  if (!ideasListEl) {
    return;
  }

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
    const scoreValue = Number.isFinite(idea.totalScore) ? Number(idea.totalScore).toFixed(2) : 'Unscored';
    const rankValue = Number.isInteger(idea.rank) ? `#${idea.rank}` : '-';
    button.innerHTML = `<strong>${truncate(idea.title)}</strong><span><span class="status-pill ${statusClass(idea.status)}">${idea.status}</span>${attachmentTag}</span><span class="idea-rank-line">Rank: ${rankValue} • Total: ${scoreValue}</span>`;

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

  updateDashboardStats();
}

function setSession(nextToken, profileHints = {}) {
  token = nextToken;

  const payload = parseJwtPayload(nextToken) || {};
  const hintEmail = typeof profileHints === 'string' ? profileHints : profileHints.email;
  const hintDisplayName = typeof profileHints === 'object' ? profileHints.displayName : null;
  currentUser.role = payload.role || 'submitter';
  currentUser.email = payload.email || hintEmail || localStorage.getItem(EMAIL_KEY) || 'unknown';
  currentUser.displayName = payload.displayName || hintDisplayName || localStorage.getItem(DISPLAY_NAME_KEY) || 'User';

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EMAIL_KEY, currentUser.email);
  localStorage.setItem(DISPLAY_NAME_KEY, currentUser.displayName);

  if (roleChip) {
    roleChip.textContent = `Role: ${currentUser.role}`;
  }
  if (emailChip) {
    emailChip.textContent = `Email: ${currentUser.email}`;
  }
  if (adminSection) {
    adminSection.classList.toggle('hidden', currentUser.role !== 'admin');
  }
  if (profileEmailEl) {
    profileEmailEl.textContent = currentUser.email;
  }
  if (profileNameEl) {
    profileNameEl.textContent = currentUser.displayName;
  }
  if (profileRoleEl) {
    profileRoleEl.textContent = currentUser.role;
  }
  if (profileSessionEl) {
    profileSessionEl.textContent = 'Active';
  }

  setDashboardSection(activeDashboardSection);
}

function clearSession() {
  token = null;
  currentUser = { role: null, email: null, displayName: null };
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EMAIL_KEY);
  localStorage.removeItem(DISPLAY_NAME_KEY);
  if (roleChip) {
    roleChip.textContent = 'Role: -';
  }
  if (emailChip) {
    emailChip.textContent = 'Email: -';
  }
  if (adminSection) {
    adminSection.classList.add('hidden');
  }
  if (profileEmailEl) {
    profileEmailEl.textContent = '-';
  }
  if (profileNameEl) {
    profileNameEl.textContent = '-';
  }
  if (profileRoleEl) {
    profileRoleEl.textContent = '-';
  }
  if (profileSessionEl) {
    profileSessionEl.textContent = 'Inactive';
  }

  activeDashboardSection = 'overview';
  setDashboardSection(activeDashboardSection);
}

function showAuthView() {
  if (authView) {
    authView.classList.remove('hidden');
  }
  if (appView) {
    appView.classList.add('hidden');
  }
  clearSelection();
}

function showAppView() {
  if (authView) {
    authView.classList.add('hidden');
  }
  if (appView) {
    appView.classList.remove('hidden');
  }
}

async function loadIdeas() {
  const ideas = await apiFetch('/ideas/ranked', {
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
    setDashboardSection('detail');
    showToast(`Idea #${ideaId} loaded.`, 'info');
  } catch (error) {
    if (ideaDetailEl) {
      ideaDetailEl.className = 'idea-detail-empty';
      ideaDetailEl.textContent = 'Unable to load idea detail.';
    }
    showToast(readableError(error), 'error');
  }
}

dashboardTabButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const targetSection = button.dataset.dashboardTab;
    if (targetSection === 'profile') {
      navigateTo('/profile');
      return;
    }

    if (getCurrentPage() === 'profile') {
      goToDashboardSection(targetSection);
      return;
    }

    setDashboardSection(targetSection);
  });
});

quickSectionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const targetSection = button.dataset.jumpSection;

    if (targetSection === 'profile') {
      navigateTo('/profile');
      return;
    }

    if (getCurrentPage() === 'profile') {
      goToDashboardSection(targetSection);
      return;
    }

    setDashboardSection(targetSection);
  });
});

if (refreshOverviewButtonEl) {
  refreshOverviewButtonEl.addEventListener('click', async () => {
    try {
      await loadIdeas();
      setDashboardSection('overview');
      showToast('Overview refreshed.', 'success');
    } catch (error) {
      showToast(readableError(error), 'error');
    }
  });
}

if (openRegisterButton) {
  openRegisterButton.addEventListener('click', () => {
    navigateTo('/register');
  });
}

if (closeRegisterButton) {
  closeRegisterButton.addEventListener('click', () => {
    navigateTo('/login');
  });
}

const registerFormEl = document.getElementById('register-form');
if (registerFormEl) {
registerFormEl.addEventListener('submit', async (event) => {
  event.preventDefault();

  const displayName = registerDisplayNameEl ? registerDisplayNameEl.value.trim() : '';
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  const role = document.getElementById('register-role').value;

  try {
    await apiFetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role, displayName }),
    });
    showToast('Registration successful. You can now sign in.', 'success');
    navigateTo('/login');
    event.target.reset();
  } catch (error) {
    showToast(readableError(error), 'error');
  }
});
}

const loginFormEl = document.getElementById('login-form');
if (loginFormEl) {
loginFormEl.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    setSession(data.token, {
      email,
      displayName: data?.user?.displayName,
    });
    showAppView();
    await loadIdeas();
    showToast('Signed in successfully.', 'success');
    navigateTo('/dashboard');
  } catch (error) {
    clearSession();
    showAuthView();
    showToast(readableError(error), 'error');
  }
});
}

const logoutButtonEl = document.getElementById('logout-btn');
if (logoutButtonEl) {
  logoutButtonEl.addEventListener('click', () => {
    clearSession();
    showAuthView();
    showToast('Signed out successfully.', 'success');
    navigateTo('/login');
  });
}

if (createIdeaFormEl) {
createIdeaFormEl.addEventListener('submit', async (event) => {
  event.preventDefault();

  const title = ideaTitleEl.value.trim();
  const description = ideaDescriptionEl.value.trim();
  const category = ideaCategoryEl.value.trim();
  const attachmentInput = attachmentInputEl;
  const file = attachmentInput.files && attachmentInput.files[0] ? attachmentInput.files[0] : null;
  const requestedStatus = pendingCreateStatus;
  pendingCreateStatus = 'submitted';

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
  if (requestedStatus === 'draft') {
    formData.append('status', 'draft');
  }
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
    showToast(requestedStatus === 'draft' ? 'Draft saved successfully.' : 'Idea created successfully.', 'success');
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
}

if (createIdeaDraftEl && createIdeaFormEl) {
  createIdeaDraftEl.addEventListener('click', () => {
    pendingCreateStatus = 'draft';
    createIdeaFormEl.requestSubmit();
  });
}

if (createIdeaSubmitEl && createIdeaFormEl) {
  createIdeaSubmitEl.addEventListener('click', () => {
    pendingCreateStatus = 'submitted';
  });
}

[ideaTitleEl, ideaDescriptionEl, ideaCategoryEl].forEach((element) => {
  if (!element) {
    return;
  }
  element.addEventListener('input', updateCreateIdeaSubmitState);
  element.addEventListener('change', updateCreateIdeaSubmitState);
});

const refreshIdeasButtonEl = document.getElementById('refresh-ideas');
if (refreshIdeasButtonEl) {
  refreshIdeasButtonEl.addEventListener('click', async () => {
    try {
      await loadIdeas();
      showToast('Ideas list refreshed.', 'success');
    } catch (error) {
      showToast(readableError(error), 'error');
    }
  });
}

const evaluateFormEl = document.getElementById('evaluate-form');
if (evaluateFormEl) {
evaluateFormEl.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!selectedIdeaId) {
    showToast('Select an idea before submitting evaluation.', 'error');
    return;
  }

  const status = document.getElementById('eval-status').value;
  const commentText = document.getElementById('eval-comment').value;

  if (!status) {
    showToast('No valid next review status for this idea.', 'error');
    return;
  }

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
}

if (scoreFormEl) {
  scoreFormEl.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!selectedIdeaId) {
      showToast('Select an idea before scoring.', 'error');
      return;
    }

    const impact = Number(scoreImpactEl.value);
    const feasibility = Number(scoreFeasibilityEl.value);
    const innovation = Number(scoreInnovationEl.value);

    const values = [impact, feasibility, innovation];
    const invalid = values.some((value) => !Number.isInteger(value) || value < 1 || value > 5);
    if (invalid) {
      showToast('Each score must be an integer between 1 and 5.', 'error');
      return;
    }

    try {
      await updateIdeaScore(selectedIdeaId, { impact, feasibility, innovation });
      await loadIdeas();
      await loadIdeaDetail(selectedIdeaId);
      showToast('Score saved successfully.', 'success');
      scoreFormEl.reset();
      setScoreFieldValue('impact', 0);
      setScoreFieldValue('feasibility', 0);
      setScoreFieldValue('innovation', 0);
    } catch (error) {
      showToast(readableError(error), 'error');
    }
  });
}

function bootstrap() {
  const page = getCurrentPage();
  const preferredDashboardSection = sessionStorage.getItem('dashboard_section');
  if (preferredDashboardSection) {
    sessionStorage.removeItem('dashboard_section');
  }

  if (page === 'dashboard' || page === 'profile') {
    showAppView();
    setDashboardSection(page === 'profile' ? 'profile' : preferredDashboardSection || 'overview');
  } else {
    showAuthView();
    if (registerPanel && openRegisterButton) {
      const isRegisterPage = page === 'register';
      registerPanel.classList.toggle('hidden', !isRegisterPage);
      openRegisterButton.classList.toggle('hidden', isRegisterPage);
    }
  }

  const storedToken = localStorage.getItem(TOKEN_KEY);
  const storedEmail = localStorage.getItem(EMAIL_KEY);
  const storedDisplayName = localStorage.getItem(DISPLAY_NAME_KEY);

  if (!storedToken) {
    if (page === 'dashboard' || page === 'profile') {
      navigateTo('/login');
    }
    return;
  }

  const payload = parseJwtPayload(storedToken);
  if (!payload || !payload.role) {
    clearSession();
    if (page === 'dashboard' || page === 'profile') {
      navigateTo('/login');
    }
    return;
  }

  setSession(storedToken, {
    email: payload.email || storedEmail,
    displayName: payload.displayName || storedDisplayName,
  });

  if (page === 'dashboard' || page === 'profile') {
    showAppView();
    setDashboardSection(page === 'profile' ? 'profile' : preferredDashboardSection || 'overview');
    loadIdeas().catch((error) => {
      showToast(readableError(error), 'error');
      if (error.status === 401) {
        clearSession();
        showAuthView();
        showToast('Session expired. Please sign in again.', 'error');
        navigateTo('/login');
      }
    });
    return;
  }

  navigateTo('/dashboard');
}

bootstrap();
updateCreateIdeaSubmitState();
updateDashboardStats();
initStarScoreControls();
