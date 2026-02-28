import { body, validationResult } from 'express-validator';

export const profileValidator = [
  body('fullName').trim().isLength({ min: 3, max: 100 }),
  body('profession').trim().isLength({ min: 2, max: 80 }),
  body('licenseNumber').trim().isLength({ min: 3, max: 50 }),
  body('country').trim().isLength({ min: 2, max: 80 }),
  body('phone').optional().trim().isLength({ max: 30 })
];

export const checkoutValidator = [
  body('priceId').trim().matches(/^price_/),
  body('planName').trim().isLength({ min: 2, max: 60 })
];

export function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  return next();
}
