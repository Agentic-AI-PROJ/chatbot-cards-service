import type { Request, Response } from 'express';
import { ChatbotCardModel } from '../models/ChatbotCards.js';
import logger from '../utils/logger.js';
import { ConversationCardModel } from '../models/ConversationCards.js';

// Create a new chatbot card
export const createChatbotCard = async (req: Request, res: Response) => {
    try {
        const {
            name,
            description,
            systemPrompt,
            visibility,
            reasoningEffort,
            llmModel,
            fileParameters,
            modelParameters
        } = req.body;

        const newCard = new ChatbotCardModel({
            name,
            description,
            systemPrompt,
            visibility,
            reasoningEffort,
            llmModel,
            fileParameters,
            modelParameters,
            createdBy: req.headers['x-user-id'],
        });

        await newCard.save();
        logger.info(`Chatbot card created: ${newCard._id}`);
        res.status(201).json(newCard);
    } catch (error) {
        logger.error('Error creating chatbot card:', error);
        res.status(500).json({ message: 'Error creating chatbot card', error });
    }
};

// Get all chatbot cards with optional filters
export const getChatbotCards = async (req: Request, res: Response) => {
    try {
        const { visibility } = req.query;

        const userId = req.headers['x-user-id'];

        // Build filter object
        const filter: any = {};
        if (visibility) filter.visibility = visibility;
        filter.status = 'active';
        filter.createdBy = userId;

        const cards = await ChatbotCardModel.find(filter)
            .sort({ createdAt: -1 });

        logger.info(`Retrieved ${cards.length} chatbot cards`);
        res.status(200).json(cards);
    } catch (error) {
        logger.error('Error fetching chatbot cards:', error);
        res.status(500).json({ message: 'Error fetching chatbot cards', error });
    }
};

// Get a single chatbot card by ID
export const getChatbotCardById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const card = await ChatbotCardModel.findById(id)

        if (!card) {
            return res.status(404).json({ message: 'Chatbot card not found' });
        }

        logger.info(`Retrieved chatbot card: ${id}`);
        res.status(200).json(card);
    } catch (error) {
        logger.error('Error fetching chatbot card:', error);
        res.status(500).json({ message: 'Error fetching chatbot card', error });
    }
};

// Update a chatbot card
export const updateChatbotCard = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { userId, ...updateData } = req.body;
        const updateUserId = req.headers['x-user-id'];

        // Find the existing card to compare changes
        const existingCard = await ChatbotCardModel.findById(id);
        if (!existingCard) {
            return res.status(404).json({ message: 'Chatbot card not found' });
        }

        // Track which fields are being changed
        const changes: { field: string; oldValue: any; newValue: any }[] = [];
        const allowedFields = [
            'name',
            'description',
            'systemPrompt',
            'visibility',
            'reasoningEffort',
            'llmModel',
            'fileParameters',
            'modelParameters',
            'status',
        ];

        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                // For nested objects, do a simple check
                if (typeof updateData[field] === 'object' && updateData[field] !== null) {
                    if (JSON.stringify(existingCard[field as keyof typeof existingCard]) !== JSON.stringify(updateData[field])) {
                        changes.push({
                            field,
                            oldValue: existingCard[field as keyof typeof existingCard],
                            newValue: updateData[field]
                        });
                    }
                } else if (existingCard[field as keyof typeof existingCard] !== updateData[field]) {
                    changes.push({
                        field,
                        oldValue: existingCard[field as keyof typeof existingCard],
                        newValue: updateData[field]
                    });
                }
            }
        }

        // Add update log if there are changes and userId is provided
        if (changes.length > 0 && updateUserId) {
            updateData.updateLogs = [
                ...existingCard.updateLogs,
                {
                    user: updateUserId,
                    updatedAt: new Date(),
                    changes,
                },
            ];
        }

        const updatedCard = await ChatbotCardModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        logger.info(`Updated chatbot card: ${id}, fields changed: ${changes.map(c => c.field).join(', ')}`);
        res.status(200).json(updatedCard);
    } catch (error) {
        logger.error('Error updating chatbot card:', error);
        res.status(500).json({ message: 'Error updating chatbot card', error });
    }
};

// Delete a chatbot card (soft delete)
export const deleteChatbotCard = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        //soft delete conversations as well
        await ConversationCardModel.updateMany(
            { chatbotCard: id },
            { status: 'deleted' }
        );

        const deletedCard = await ChatbotCardModel.findByIdAndUpdate(
            id,
            { status: 'deleted' },
            { new: true }
        );

        if (!deletedCard) {
            return res.status(404).json({ message: 'Chatbot card not found' });
        }

        logger.info(`Soft deleted chatbot card: ${id}`);
        res.status(200).json({ message: 'Chatbot card deleted successfully', card: deletedCard });
    } catch (error) {
        logger.error('Error deleting chatbot card:', error);
        res.status(500).json({ message: 'Error deleting chatbot card', error });
    }
};
