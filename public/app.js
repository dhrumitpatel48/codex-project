import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';

const config = {
  apiKey: window.localStorage.getItem('firebaseApiKey') || '',
  authDomain: window.localStorage.getItem('firebaseAuthDomain') || '',
  projectId: window.localStorage.getItem('firebaseProjectId') || ''
};

let auth;
let currentToken;

const authState = document.getElementById('authState');
const profileResult = document.getElementById('profileResult');

function bootstrapFirebase() {
  if (!config.apiKey || !config.authDomain || !config.projectId) {
    authState.textContent = 'Set firebaseApiKey, firebaseAuthDomain, firebaseProjectId in localStorage to enable auth.';
    return false;
  }

  const app = initializeApp(config);
  auth = getAuth(app);
  return true;
}

document.getElementById('loginBtn').addEventListener('click', async () => {
  if (!auth && !bootstrapFirebase()) {
    return;
  }

  const credential = await signInAnonymously(auth);
  currentToken = await credential.user.getIdToken();
  authState.textContent = `Signed in as ${credential.user.uid}`;
});

document.getElementById('profileForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!currentToken) {
    profileResult.textContent = 'Please sign in first.';
    return;
  }

  const form = new FormData(event.target);
  const payload = Object.fromEntries(form.entries());

  const response = await fetch('/api/profiles/me', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${currentToken}`
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  profileResult.textContent = JSON.stringify(data, null, 2);
});

document.getElementById('subscribeBtn').addEventListener('click', async () => {
  if (!currentToken) {
    profileResult.textContent = 'Please sign in first.';
    return;
  }

  const priceId = document.getElementById('priceId').value;

  const response = await fetch('/api/payments/checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${currentToken}`
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
