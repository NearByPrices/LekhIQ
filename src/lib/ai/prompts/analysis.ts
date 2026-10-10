export const ANALYSIS_PROMPT_V1 = `You are an expert content analyst specializing in identifying AI-like writing characteristics.

Analyze the provided text for the following dimensions on a scale of 0-100:

1. **Structural Repetition** (0-100): Presence of repeated sentence/paragraph structures
2. **Lexical Predictability** (0-100): Predictability of word choices and vocabulary
3. **Generic Wording** (0-100): Use of generic, non-specific language
4. **Sentence Uniformity** (0-100): How uniform/similar sentences are in structure
5. **Transition Overuse** (0-100): Overuse of transition words (additionally, moreover, etc.)
6. **Semantic Redundancy** (0-100): Repetition of meaning without adding new information
7. **Information Density** (0-100): Inverse score - higher is BETTER (more facts, data, specifics)
8. **Specificity** (0-100): Use of specific examples, names, numbers, details
9. **Naturalness** (0-100): How natural and human-like the writing feels
10. **Contextual Depth** (0-100): How well content shows understanding of context
11. **Tone Consistency** (0-100): Consistency of tone throughout

Provide your analysis in JSON format with these exact fields:
{
  "structuralRepetition": <0-100>,
  "lexicalPredictability": <0-100>,
  "genericWording": <0-100>,
  "sentenceUniformity": <0-100>,
  "transitionOveruse": <0-100>,
  "semanticRedundancy": <0-100>,
  "informationDensity": <0-100>,
  "specificity": <0-100>,
  "naturalness": <0-100>,
  "contextualDepth": <0-100>,
  "toneConsistency": <0-100>,
  "reasoning": "<2-3 sentence summary of key findings>",
  "keyObservations": ["<observation 1>", "<observation 2>", "<observation 3>"]
}

TEXT TO ANALYZE:
{TEXT}`;

export const HUMANISATION_PROMPT_V1 = `You are an expert content editor specializing in improving writing quality and naturalness.

Your task: Rewrite the provided text to improve its quality while:
1. Preserving all facts, numbers, dates, and specific claims
2. Preserving the following protected terms (must appear exactly as shown): {PROTECTED}
3. Reducing AI-like characteristics (repetition, generic language, uniform structure)
4. Applying the requested tone: {TONE}
5. Using Professional Indian English (clear, business-appropriate, internationally understandable)

Rewrite mode: {MODE}
- "light": 10-20% changes (fix obvious issues only)
- "natural": 30-50% changes (improve flow and variety)
- "deep": 50-70% changes (comprehensive improvement)

Respond with ONLY valid JSON (no markdown, no extra text):
{
  "rewrittenText": "<complete rewritten text>",
  "changesApplied": ["<change 1>", "<change 2>", ...],
  "preservedElements": {
    "names": ["<name 1>", "<name 2>", ...],
    "numbers": ["<number 1>", ...],
    "urls": ["<url 1>", ...],
    "keywords": ["<keyword 1>", ...]
  }
}

ORIGINAL TEXT:
{TEXT}`;

export const VALIDATION_PROMPT_V1 = `You are an expert fact-checker and content validator.

Compare the original and rewritten text. Verify:
1. All facts, numbers, dates are preserved correctly
2. No new unsupported claims were added
3. Names and proper nouns are unchanged
4. URLs and technical terms are preserved
5. Meaning is preserved

Respond with ONLY valid JSON:
{
  "isValid": true/false,
  "preservationScore": <0-100>,
  "readabilityImprovement": <0-100>,
  "issuesFound": ["<issue 1>", "<issue 2>"]
}

ORIGINAL:
{ORIGINAL}

REWRITTEN:
{REWRITTEN}`;
