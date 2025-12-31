import { Router } from 'express';
import {
    createChatbotCard,
    getChatbotCards,
    getChatbotCardById,
    updateChatbotCard,
    deleteChatbotCard,
} from '../controllers/chatbot-cards.controller.js';

const router = Router();

// Create a new chatbot card
router.post('/', createChatbotCard);

// Get all chatbot cards (with optional filters)
router.get('/', getChatbotCards);

// Get a single chatbot card by ID
router.get('/:id', getChatbotCardById);

// Update a chatbot card
router.put('/:id', updateChatbotCard);

// Delete a chatbot card (soft delete)
router.delete('/:id', deleteChatbotCard);

export default router;
