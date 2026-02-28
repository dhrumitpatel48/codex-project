import { FieldValue } from 'firebase-admin/firestore';
import { getFirestore } from '../config/firebase.js';

const SOURCE_URL = 'https://jsonplaceholder.typicode.com/users';

export async function syncExternalRecords() {
  const response = await fetch(SOURCE_URL, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`Source sync failed with status ${response.status}`);
  }

  const users = await response.json();
  const db = getFirestore();

  const batch = db.batch();
  users.forEach((user) => {
    const docRef = db.collection('externalDirectory').doc(String(user.id));
    batch.set(docRef, {
      source: 'jsonplaceholder',
      displayName: user.name,
      company: user.company?.name || null,
      website: user.website || null,
      syncedAt: FieldValue.serverTimestamp()
    }, { merge: true });
  });

  await batch.commit();
  return users.length;
}
