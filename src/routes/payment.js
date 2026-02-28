import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createCheckout } from '../services/payment-service.js';
import { checkoutValidator, handleValidation } from '../utils/validators.js';

const router = Router();

router.post('/checkout-session', requireAuth, checkoutValidator, handleValidation, async (req, res, next) => {
  try {
    const session = await createCheckout({
      userId: req.user.uid,
      email: req.user.email,
      priceId: req.body.priceId,
      planName: req.body.planName
    });

    return res.json({ session });
  } catch (error) {
    return next(error);
  }
});

export default router;
