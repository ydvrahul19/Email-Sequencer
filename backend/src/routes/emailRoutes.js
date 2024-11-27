import express from 'express';
import { scheduleEmailController } from '../controllers/emailController.js';

const router = express.Router();

router.post('/schedule', scheduleEmailController);

export default router;
