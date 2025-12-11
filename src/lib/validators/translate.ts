import { z } from 'zod';

export const translateSchema = z.object({
    text: z.string().min(1, "Text is required"),
    source: z.string().default("en"),
    target: z.string().default("ur"),
});

export type TranslateInput = z.infer<typeof translateSchema>;
