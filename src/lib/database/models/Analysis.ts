// models/Analytics.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IAnalytics extends Document {
    userId: mongoose.Types.ObjectId; // ref to User
    documentName: string;
    documentType: string;
    summary: string;
    risks: string[];
    verdict: string;
    createdAt: Date;
    updatedAt: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        documentName: {
            type: String,
            required: true,
            trim: true,
        },
        documentType: {
            type: String,
            required: true,
        },
        summary: {
            type: String,
            required: true,
        },
        risks: {
            type: [String],
            default: [],
        },
        verdict: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const Analytics =
    mongoose.models.Analytics ||
    mongoose.model<IAnalytics>("Analytics", AnalyticsSchema);

export default Analytics;
