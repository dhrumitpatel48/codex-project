import { FieldValue } from 'firebase-admin/firestore';
import { getFirestore } from '../config/firebase.js';

const collectionName = 'professionalProfiles';

export async function upsertProfile(userId, payload) {
  const db = getFirestore();
  const docRef = db.collection(collectionName).doc(userId);

  const safePayload = {
    fullName: payload.fullName,
    profession: payload.profession,
    licenseNumber: payload.licenseNumber,
    country: payload.country,
    phone: payload.phone || null,
    updatedAt: FieldValue.serverTimestamp()
  };

  await docRef.set(safePayload, { merge: true });
  return safePayload;
}

export async function getProfile(userId) {
  const db = getFirestore();
  const doc = await db.collection(collectionName).doc(userId).get();
  if (!doc.exists) {
    return null;
  }
  return doc.data();
}
