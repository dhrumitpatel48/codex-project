import admin from 'firebase-admin';
import { getFirebaseApp } from '../config/firebase.js';

export async function requireAuth(req, res, next) {
  try {
    getFirebaseApp();
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization token.' });
    }

    const idToken = header.replace('Bearer ', '').trim();
    const decodedToken = await admin.auth().verifyIdToken(idToken, true);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      role: decodedToken.role || 'user'
    };

    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid authentication token.' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  return next();
}
