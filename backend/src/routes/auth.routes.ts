// ===========================================
// LIFELINK - Auth Routes
// ===========================================

import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, verify2FASchema, changePasswordSchema } from '../validators/schemas';

const router = Router();

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/verify-2fa', validate(verify2FASchema), AuthController.verify2FA);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', authenticate, AuthController.logout);
router.post('/setup-2fa', authenticate, AuthController.setup2FA);
router.post('/enable-2fa', authenticate, AuthController.enable2FA);
router.post('/change-password', authenticate, validate(changePasswordSchema), AuthController.changePassword);
router.get('/profile', authenticate, AuthController.getProfile);

export default router;
