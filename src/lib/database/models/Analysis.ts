// models/Analytics.ts
import { RiskItem } from "@/lib/types";
import mongoose, { Document, Schema } from "mongoose";

export interface IAnalytics extends Document {
    userId: mongoose.Types.ObjectId; // ref to User
    documentName: string;
    documentType: string;
    summary: string;
    risks: RiskItem[];
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
            type: [new Schema<RiskItem>({
                description: { type: String, required: true },
                level: { type: String, required: true },
                category: { type: String, required: true },
                recommendation: { type: String, required: true },
                clause_reference: { type: String, required: true },
            })],
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
