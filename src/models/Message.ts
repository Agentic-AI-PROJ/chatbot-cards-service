import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
    conversationId: mongoose.Types.ObjectId;
    userId?: mongoose.Types.ObjectId;
    role: string;
    content: any;
    metadata?: any;
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema: Schema = new Schema(
    {
        conversationId: { type: Schema.Types.ObjectId, ref: 'ConversationCards', required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, required: true },
        content: { type: Schema.Types.Mixed, required: true },
        metadata: { type: Schema.Types.Mixed },
    },
    { timestamps: true }
);

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
