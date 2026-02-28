import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getProfile, upsertProfile } from '../services/profile-service.js';
import { handleValidation, profileValidator } from '../utils/validators.js';

const router = Router();

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const profile = await getProfile(req.user.uid);
    return res.json({ profile });
  } catch (error) {
    return next(error);
  }
});

router.put('/me', requireAuth, profileValidator, handleValidation, async (req, res, next) => {
  try {
    const profile = await upsertProfile(req.user.uid, req.body);
    return res.json({ profile, status: 'saved' });
  } catch (error) {
    return next(error);
  }
});

export default router;
