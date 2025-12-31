import { Schema, model, Document } from 'mongoose';

export interface ChangeLog {
    field: string;
    oldValue: any;
    newValue: any;
}

export interface UpdateLog {
    user: Schema.Types.ObjectId;
    updatedAt: Date;
    changes: ChangeLog[];
}

export interface ChatbotCard extends Document {
    name: string;
    description: string;
    systemPrompt: string;
    visibility: 'public' | 'private';
    reasoningEffort: 'none' | 'minimal' | 'low' | 'medium' | 'high';
    llmModel: string;
    fileParameters: {
        fileUploadAllowed: boolean;
        allowedFileTypes: string[];
        fileUploadSizeLimit: number;
    };
    modelParameters: {
        temperature: number;
        maxTokens: number;
        topP: number;
        frequencyPenalty: number;
        presencePenalty: number;
    };
    createdBy: Schema.Types.ObjectId;
    updateLogs: UpdateLog[];
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

const ChangeLogSchema = new Schema<ChangeLog>({
    field: { type: String, required: true },
    oldValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
}, { _id: false });

const UpdateLogSchema = new Schema<UpdateLog>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    updatedAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    changes: {
        type: [ChangeLogSchema],
        required: true,
        default: [],
    },
});

const ChatbotCardSchema = new Schema<ChatbotCard>(
    {
        name: { type: String, required: true },
        description: { type: String },
        systemPrompt: { type: String, required: true },
        visibility: { type: String, enum: ['public', 'private'], required: true },
        reasoningEffort: { type: String, enum: ['none', 'minimal', 'low', 'medium', 'high'], required: true, default: 'minimal' },
        llmModel: { type: String, required: true, default: 'gpt-3.5-turbo' },
        fileParameters: {
            fileUploadAllowed: { type: Boolean, required: true, default: false },
            allowedFileTypes: { type: [String], required: true, default: [] },
            fileUploadSizeLimit: { type: Number, required: true, default: 10 },
        },
        modelParameters: {
            temperature: { type: Number, required: true, default: 0.7 },
            maxTokens: { type: Number, required: true, default: 100 },
            topP: { type: Number, required: true, default: 1 },
            frequencyPenalty: { type: Number, required: true, default: 0 },
            presencePenalty: { type: Number, required: true, default: 0 },
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        updateLogs: {
            type: [UpdateLogSchema],
            default: [],
        },
        status: {
            type: String,
            enum: [
                'active',
                'inactive',
                'banned',
                'deleted',
                'suspended',
                'pending',
                'disabled',
            ],
            default: 'active',
        },
    },
    {
        timestamps: true,
    }
);

export const ChatbotCardModel = model<ChatbotCard>('ChatbotCard', ChatbotCardSchema, 'chatbotCards');
