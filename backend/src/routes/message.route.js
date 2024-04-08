import express from 'express';
import protectedRoute from '../middlewares/protectedRoute.js';
import message from '../controllers/message.controller.js';
const router = express.Router();
router.get('/conversations', protectedRoute, message.getConversations);
router.get('/:otherUserId', protectedRoute, message.getMessages);
router.post('/', protectedRoute, message.sendMessage);
export default router;