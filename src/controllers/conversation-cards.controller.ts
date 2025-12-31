import type { Request, Response } from 'express';
import { ChatbotCardModel } from '../models/ChatbotCards.js';
import logger from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';
import { ConversationCardModel } from '../models/ConversationCards.js';
import axios from 'axios';
import { Message } from '../models/Message.js';

// Create a new chatbot card
export const createConversationCard = async (req: Request, res: Response) => {
    try {
        const {
            chatbotCard,
        } = req.body;

        const newConversationCard = new ConversationCardModel({
            name: 'New Conversation',
            guid: uuidv4(),
            chatbotCard,
            createdBy: req.headers['x-user-id'],
        });

        await newConversationCard.save();
        logger.info(`Conversation card created: ${newConversationCard._id}`);
        res.status(201).json(newConversationCard);
    } catch (error) {
        logger.error('Error creating conversation card:', error);
        res.status(500).json({ message: 'Error creating conversation card', error });
    }
};

// Get all chatbot cards with optional filters
export const getConversationCards = async (req: Request, res: Response) => {
    try {
        const { chatbotCard } = req.params;
        logger.info(`Retrieving conversation cards for chatbot card: ${chatbotCard}`);

        const userId = req.headers['x-user-id'];

        // Build filter object
        const filter: any = {};
        filter.status = 'active';
        filter.createdBy = userId;
        filter.chatbotCard = chatbotCard;

        logger.info(`Filter: ${JSON.stringify(filter)}`);

        const conversations = await ConversationCardModel.find(filter)
            .sort({ createdAt: -1 });

        logger.info(`Retrieved ${conversations.length} conversation cards`);
        res.status(200).json(conversations);
    } catch (error) {
        logger.error('Error fetching conversation cards:', error);
        res.status(500).json({ message: 'Error fetching conversation cards', error });
    }
};

// Get a single chatbot card by ID
export const getConversationCardById = async (req: Request, res: Response) => {
    try {
        const { guid } = req.params;

        const conversation = await ConversationCardModel.findOne({ guid })

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation card not found' });
        }
        const messages = await Message.find({ conversationId: conversation._id, role: { $in: ['user', 'assistant', 'tool_call', 'tool_result'] } });

        logger.info(`Retrieved conversation card: ${guid}`);
        res.status(200).json({ conversation, messages });
    } catch (error) {
        logger.error('Error fetching conversation card:', error);
        res.status(500).json({ message: 'Error fetching conversation card', error });
    }
};

export const llmMessage = async (req: Request, res: Response) => {
    try {
        const { guid } = req.params;
        const { message } = req.body;

        const conversation = await ConversationCardModel.findOne({ guid }).populate('chatbotCard');
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation card not found' });
        }
        logger.info(`Retrieved conversation card: ${JSON.stringify(conversation.chatbotCard.llmModel)}`);

        if (!message) {
            return res.status(400).json({ message: "Message is required" });
        }

        // Set SSE headers and flush
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no'
        });
        res.flushHeaders();

        // Prepare payload for LLM service
        const payload = {
            model: conversation.chatbotCard.llmModel,
            messages: [{ role: 'user', content: message }],
            reasoning_effort: conversation.chatbotCard.reasoningEffort
        };

        // Stream from LLM service
        const response = await axios.post('http://localhost:3005/stream', payload, {
            responseType: 'stream',
            headers: {
                'Accept': 'text/event-stream',
                'Content-Type': 'application/json'
            },
            timeout: 0, // No timeout
            decompress: false // Prevent axios from buffering to decompress
        });

        logger.info(`Streaming from LLM service started`);

        response.data.on('data', (chunk: Buffer) => {
            const text = chunk.toString();
            const lines = text.split('\n');

            for (const line of lines) {
                if (!line.trim() || line.includes('[DONE]')) continue;

                if (line.startsWith('data:')) {
                    const dataLine = line.slice(5).trim();
                    try {
                        const parsed = JSON.parse(dataLine);
                        const delta = parsed.choices?.[0]?.delta || {};

                        const reasoning = delta.reasoning_content || null;
                        const content = delta.content || null;

                        if (reasoning !== null) {
                            logger.info(`Streaming from LLM Reasoning: ${reasoning}`);
                            res.write(`event: reasoning\ndata: ${JSON.stringify(reasoning)}\n\n`);
                        }

                        if (content !== null) {
                            logger.info(`Streaming from LLM Content: ${content}`);
                            res.write(`event: content\ndata: ${JSON.stringify(content)}\n\n`);
                        }
                    } catch (e) {
                        logger.error('Error parsing chunk line:', e);
                    }
                }
            }
        });

        response.data.on('end', () => {
            logger.info(`Streaming from LLM service ended.`);
            res.end();
        });

        response.data.on('error', (err: any) => {
            logger.error('Error streaming from LLM service:', err);
            res.write(`event: error\ndata: "Error streaming response"\n\n`);
            res.end();
        });

    } catch (err) {
        console.error("llmMessage error:", err);
        if (!res.headersSent) {
            res.status(500).json({ message: "Internal error" });
        } else {
            res.write(`event: error\ndata: "Internal error"\n\n`);
            res.end();
        }
    }
};

// Delete a chatbot card (soft delete)
export const deleteConversationCard = async (req: Request, res: Response) => {
    try {
        const { guid } = req.params;

        const deletedCard = await ConversationCardModel.findOneAndUpdate(
            { guid: guid },
            { status: 'deleted' },
            { new: true }
        );

        if (!deletedCard) {
            return res.status(404).json({ message: 'Conversation card not found' });
        }

        logger.info(`Soft deleted conversation card: ${guid}`);
        res.status(200).json({ message: 'Conversation card deleted successfully', card: deletedCard });
    } catch (error) {
        logger.error('Error deleting conversation card:', error);
        res.status(500).json({ message: 'Error deleting conversation card', error });
    }
};
