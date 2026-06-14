import express from 'express';
import { createGroupConversation, getGroupConversations } from '../controllers/conversation.controller.js';
import protectRoute from '../middleware/protectRoute.js';

const router = express.Router();

router.get('/groups', protectRoute, getGroupConversations);
router.post('/group', protectRoute, createGroupConversation);

export default router;
