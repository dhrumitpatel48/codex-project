import cron from 'node-cron';
import { syncExternalRecords } from '../services/sync-service.js';

export function startSyncJob() {
  cron.schedule('0 */6 * * *', async () => {
    try {
      const count = await syncExternalRecords();
      console.info(`[sync-job] Synced ${count} external records.`);
    } catch (error) {
      console.error('[sync-job] Error running sync job:', error.message);
    }
  });
}
