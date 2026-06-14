import express from 'express';
import { getMessages, sendMessage, markMessagesAsRead, deleteMessage } from '../controllers/message.controller.js';
import protectRoute from '../middleware/protectRoute.js';

const router = express.Router();

router.get('/:id', protectRoute, getMessages);
router.post('/send/:id', protectRoute, sendMessage);
router.put('/mark-read/:id', protectRoute, markMessagesAsRead);
router.delete('/:id', protectRoute, deleteMessage);

export default router;
