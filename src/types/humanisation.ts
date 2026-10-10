/**
 * Humanisation types and schemas
 */

import { z } from 'zod';

export const RewriteModeEnum = z.enum(['light', 'natural', 'deep']);
export type RewriteMode = z.infer<typeof RewriteModeEnum>;

export const ToneEnum = z.enum([
  'professional',
  'conversational',
  'corporate',
  'educational',
  'technical',
  'premium',
  'sales',
  'neutral',
]);
export type Tone = z.infer<typeof ToneEnum>;

export const HumanisationRequestSchema = z.object({
  contentDocumentId: z.string().optional(),
  analysisRunId: z.string().optional(),
  originalText: z.string().min(10).max(50000),
  rewriteMode: RewriteModeEnum.default('natural'),
  tone: ToneEnum.default('professional'),
  primaryKeyword: z.string().optional(),
  secondaryKeywords: z.array(z.string()).default([]),
  lockedPhrases: z.array(z.string()).default([]),
});

export type HumanisationRequest = z.infer<typeof HumanisationRequestSchema>;

export const HumanisationChangeSchema = z.object({
  type: z.enum([
    'repetition_reduced',
    'clarity_improved',
    'flow_improved',
    'grammar_fixed',
    'length_optimized',
    'tone_adjusted',
    'structure_improved',
  ]),
  description: z.string(),
});

export type HumanisationChange = z.infer<typeof HumanisationChangeSchema>;

export const HumanisationValidationSchema = z.object({
  status: z.enum(['passed', 'warning', 'failed']),
  factsPreserved: z.boolean().optional(),
  numbersPreserved: z.boolean().optional(),
  entitiesPreserved: z.boolean().optional(),
  keywordsPreserved: z.boolean().optional(),
  urlsPreserved: z.boolean().optional(),
  warnings: z.array(z.string()).default([]),
  missing: z.array(z.string()).default([]),
  missingElements: z.array(z.string()).default([]),
  addedClaims: z.array(z.string()).default([]),
});

export type HumanisationValidation = z.infer<typeof HumanisationValidationSchema>;

export const HumanisationResponseSchema = z.object({
  rewrittenContent: z.string(),
  mode: RewriteModeEnum,
  tone: ToneEnum,
  changes: z.array(HumanisationChangeSchema),
  validation: HumanisationValidationSchema,
  preservedElements: z.object({
    urls: z.array(z.string()).default([]),
    emails: z.array(z.string()).default([]),
    phones: z.array(z.string()).default([]),
    keywords: z.array(z.string()).default([]),
    lockedPhrases: z.array(z.string()).default([]),
    numbers: z.array(z.string()).default([]),
    prices: z.array(z.string()).default([]),
  }).default(() => ({
    urls: [],
    emails: [],
    phones: [],
    keywords: [],
    lockedPhrases: [],
    numbers: [],
    prices: [],
  })),
  warnings: z.array(z.string()).default([]),
  processingMetadata: z.object({
    originalLength: z.number(),
    rewrittenLength: z.number(),
    modelName: z.string(),
    promptVersion: z.string(),
    processingTime: z.number(),
  }),
});

export type HumanisationResponse = z.infer<typeof HumanisationResponseSchema>;

// Database save schema
export const HumanisationRunSchema = z.object({
  id: z.string().optional(),
  contentDocumentId: z.string(),
  analysisRunId: z.string().optional(),
  mode: RewriteModeEnum,
  tone: ToneEnum,
  originalText: z.string(),
  rewrittenText: z.string(),
  protectedContentJson: z.record(z.string(), z.any()).optional(),
  validationJson: HumanisationValidationSchema.optional(),
  changesJson: z.array(HumanisationChangeSchema).optional(),
  beforeAiScore: z.number().optional(),
  afterAiScore: z.number().optional(),
  beforeQualityScore: z.number().optional(),
  afterQualityScore: z.number().optional(),
  beforeReadabilityScore: z.number().optional(),
  afterReadabilityScore: z.number().optional(),
  beforeRepetitionScore: z.number().optional(),
  afterRepetitionScore: z.number().optional(),
  modelName: z.string(),
  promptVersion: z.string(),
  processingMetadata: z.object({
    originalLength: z.number(),
    rewrittenLength: z.number(),
    processingTime: z.number(),
  }).optional(),
  createdAt: z.string().optional(),
});

export type HumanisationRun = z.infer<typeof HumanisationRunSchema>;
