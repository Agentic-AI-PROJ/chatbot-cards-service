import { Router } from 'express';
import {
    createConversationCard,
    getConversationCards,
    getConversationCardById,
    deleteConversationCard,
    llmMessage,
} from '../controllers/conversation-cards.controller.js';

const router = Router();

// Create a new chatbot card
router.post('/', createConversationCard);

// Get all chatbot cards (with optional filters)
router.get('/card/:chatbotCard', getConversationCards);

// Get a single chatbot card by ID
router.get('/:guid', getConversationCardById);

// Post a message
router.post('/:guid/messages', llmMessage);

// Delete a chatbot card (soft delete)
router.delete('/:guid', deleteConversationCard);

export default router;
