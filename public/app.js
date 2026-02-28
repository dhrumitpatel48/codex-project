import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';

const DRAFT_KEY = 'profileDraft';
const THEME_KEY = 'appTheme';

const config = {
  apiKey: window.localStorage.getItem('firebaseApiKey') || '',
  authDomain: window.localStorage.getItem('firebaseAuthDomain') || '',
  projectId: window.localStorage.getItem('firebaseProjectId') || ''
};

let auth;
let currentToken;

const authState = document.getElementById('authState');
const securityState = document.getElementById('securityState');
const completionMeter = document.getElementById('completionMeter');
const profileResult = document.getElementById('profileResult');
const profileForm = document.getElementById('profileForm');
const profilePreview = document.getElementById('profilePreview');
const priceIdInput = document.getElementById('priceId');

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1800);
}

function sanitizeInput(value) {
  return String(value || '')
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .trim();
}

function getDraftPayload() {
  return Object.fromEntries(new FormData(profileForm).entries());
}

function saveDraft() {
  const payload = getDraftPayload();
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
  renderPreview(payload);
  updateCompletion(payload);
}

function renderPreview(payload) {
  const fields = ['fullName', 'profession', 'licenseNumber', 'country', 'phone'];
  profilePreview.innerHTML = fields
    .map((field) => {
      const title = field.replace(/([A-Z])/g, ' $1').replace(/^./, (m) => m.toUpperCase());
      const value = sanitizeInput(payload[field]) || '—';
      return `<div><dt>${title}</dt><dd>${value}</dd></div>`;
    })
    .join('');
}

function updateCompletion(payload = getDraftPayload()) {
  const requiredFields = ['fullName', 'profession', 'licenseNumber', 'country'];
  const completed = requiredFields.filter((field) => sanitizeInput(payload[field])).length;
  const percent = Math.round((completed / requiredFields.length) * 100);
  completionMeter.textContent = `${percent}%`;
  securityState.textContent = percent === 100 ? 'Strong profile completeness' : 'Add required details';
}

function applyTheme(theme) {
  document.body.classList.toggle('dark', theme === 'dark');
  window.localStorage.setItem(THEME_KEY, theme);
}

function bootstrapFirebase() {
  if (!config.apiKey || !config.authDomain || !config.projectId) {
    authState.textContent = 'Set firebaseApiKey, firebaseAuthDomain, firebaseProjectId in localStorage to enable auth.';
    return false;
  }

  const app = initializeApp(config);
  auth = getAuth(app);
  return true;
}

function loadDraft() {
  const rawDraft = window.localStorage.getItem(DRAFT_KEY);
  if (!rawDraft) {
    renderPreview({});
    updateCompletion({});
    return;
  }

  try {
    const draft = JSON.parse(rawDraft);
    for (const [key, value] of Object.entries(draft)) {
      const field = profileForm.elements.namedItem(key);
      if (field) {
        field.value = value;
      }
    }
    renderPreview(draft);
    updateCompletion(draft);
    showToast('Draft restored');
  } catch {
    window.localStorage.removeItem(DRAFT_KEY);
  }
}

document.getElementById('themeBtn').addEventListener('click', () => {
  const next = document.body.classList.contains('dark') ? 'light' : 'dark';
  applyTheme(next);
});

document.getElementById('clearDraftBtn').addEventListener('click', () => {
  profileForm.reset();
  window.localStorage.removeItem(DRAFT_KEY);
  renderPreview({});
  updateCompletion({});
  showToast('Draft cleared');
});

document.getElementById('exportProfileBtn').addEventListener('click', () => {
  const payload = getDraftPayload();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'profile-draft.json';
  anchor.click();
  URL.revokeObjectURL(url);
  showToast('Draft exported');
});

profileForm.addEventListener('input', saveDraft);

document.getElementById('loginBtn').addEventListener('click', async () => {
  if (!auth && !bootstrapFirebase()) {
    return;
  }

  const credential = await signInAnonymously(auth);
  currentToken = await credential.user.getIdToken();
  authState.textContent = `Signed in as ${credential.user.uid}`;
  showToast('Signed in securely');
});

profileForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!currentToken) {
    profileResult.textContent = 'Please sign in first.';
    return;
  }

  const payload = Object.fromEntries(
    Object.entries(getDraftPayload()).map(([key, value]) => [key, sanitizeInput(value)])
  );

  const response = await fetch('/api/profiles/me', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${currentToken}`,
      'X-Requested-With': 'XMLHttpRequest'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  profileResult.textContent = JSON.stringify(data, null, 2);
  showToast(response.ok ? 'Profile saved' : 'Could not save profile');
});

document.getElementById('subscribeBtn').addEventListener('click', async () => {
  if (!currentToken) {
    profileResult.textContent = 'Please sign in first.';
    return;
  }

  const priceId = sanitizeInput(priceIdInput.value);
  if (!priceId.startsWith('price_')) {
    profileResult.textContent = 'Please provide a valid Stripe price id starting with price_';
    return;
  }

  const response = await fetch('/api/payments/checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${currentToken}`,
      'X-Requested-With': 'XMLHttpRequest'
    },
    body: JSON.stringify({ priceId, planName: 'Professional Plan' })
  });

  const data = await response.json();
  if (data?.session?.url) {
    window.location.href = data.session.url;
  } else {
    profileResult.textContent = JSON.stringify(data, null, 2);
  }
});

applyTheme(window.localStorage.getItem(THEME_KEY) || 'light');
loadDraft();
