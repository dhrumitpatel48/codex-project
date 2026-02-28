import admin from 'firebase-admin';
import { getEnv } from './env.js';

let app;

export function getFirebaseApp() {
  if (!app) {
    const env = getEnv();
    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.firebase.projectId,
        clientEmail: env.firebase.clientEmail,
        privateKey: env.firebase.privateKey
      })
    });
  }
  return app;
}

export function getFirestore() {
  return getFirebaseApp().firestore();
}
