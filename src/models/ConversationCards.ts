import { model, Schema } from "mongoose";
import type { ChatbotCard } from "./ChatbotCards.js";

export interface ConversationCard extends Document {
    name: string;
    summary: string;
    guid: string;
    status: string;
    chatbotCard: ChatbotCard;
    createdBy: Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ConversationCardSchema = new Schema<ConversationCard>(
    {
        name: { type: String, required: true, default: 'New Conversation' },
        summary: { type: String, required: false },
        guid: { type: String, required: true },
        status: {
            type: String,
            enum: [
                'active',
                'deleted',
            ],
            default: 'active',
        },
        chatbotCard: {
            type: Schema.Types.ObjectId,
            ref: 'ChatbotCard',
            required: true,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

ConversationCardSchema.index({ guid: 1 }, { unique: true });

export const ConversationCardModel = model<ConversationCard>('ConversationCard', ConversationCardSchema, 'ConversationCards');