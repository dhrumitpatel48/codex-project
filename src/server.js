import { validateEnv, getEnv } from './config/env.js';
import { createApp } from './app.js';
import { getFirebaseApp } from './config/firebase.js';
import { startSyncJob } from './jobs/sync-job.js';

validateEnv();
getFirebaseApp();

const env = getEnv();
const app = createApp();

app.listen(env.port, () => {
  console.info(`Server running on port ${env.port}`);
  startSyncJob();
});
