import { z } from 'zod';

export const AnalyseRequestSchema = z.object({
  type: z.enum(['paste', 'url']),
  content: z.string().min(50).max(100000),
  title: z.string().optional(),
  keywords: z.array(z.string()).optional(),
});

export type AnalyseRequest = z.infer<typeof AnalyseRequestSchema>;

export const HumanisationRequestSchema = z.object({
  contentId: z.string().uuid(),
  mode: z.enum(['light', 'natural', 'deep']),
  tone: z.enum([
    'professional',
    'conversational',
    'corporate',
    'educational',
    'technical',
    'premium',
    'sales',
    'neutral',
  ]),
  keywordLock: z.array(z.string()).optional(),
  phraseLock: z.array(z.string()).optional(),
});

export type HumanisationRequest = z.infer<typeof HumanisationRequestSchema>;

export const APIErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
  details: z.record(z.string(), z.any()).optional(),
});

export type APIError = z.infer<typeof APIErrorSchema>;
