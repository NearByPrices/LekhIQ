import { describe, it, expect } from 'vitest';
import { evaluateAILikeness, AILikenessRuleEngine } from './ai-likeness-rules';

describe('AILikenessRuleEngine', () => {
  it('should detect low AI-likeness in natural human text', () => {
    const naturalText = `I've been thinking about this problem for months. The solution isn't straightforward.
    We need to consider multiple approaches. Some work better than others. It depends on your specific context.

    What I found helpful was trying different methods. The first one didn't work well. The second attempt was closer.
    Eventually, I stumbled upon something that worked! I'm really happy with the results.`;

    const result = evaluateAILikeness(naturalText);
    expect(result.score).toBeLessThan(50);
  });

  it('should detect high AI-likeness in templated text', () => {
    const aiText = `In today's rapidly evolving digital landscape, businesses face unprecedented challenges.
    Furthermore, organizations must adapt to changing market conditions. Moreover, they need to implement innovative solutions.
    Additionally, companies should consider strategic planning. Furthermore, they must prioritize customer engagement.
    Additionally, market research is essential. Moreover, data analysis provides valuable insights.
    Furthermore, competitive advantage is crucial. In conclusion, success requires comprehensive strategies.`;

    const result = evaluateAILikeness(aiText);
    expect(result.score).toBeGreaterThan(50);
    expect(['moderate', 'high', 'very_high']).toContain(result.riskLevel);
  });

  it('should detect uniform sentence lengths', () => {
    const uniformText = `One two three. Four five six. Seven eight nine. Ten eleven twelve. Thirteen fourteen fifteen.`;
    const result = evaluateAILikeness(uniformText);

    expect(result.signals.some((s) => s.name.includes('sentence'))).toBe(true);
  });

  it('should detect repeated sentence openings', () => {
    const repeatedOpeningsText = `This is important. This is crucial. This is essential. This is vital. This is necessary.
    Additionally, we must consider. Additionally, we should note. Additionally, we can see.`;

    const result = evaluateAILikeness(repeatedOpeningsText);
    expect(result.signals.some((s) => s.name.includes('opening'))).toBe(true);
  });

  it('should detect low lexical diversity', () => {
    const repetitiveText = `The thing is important. The thing is good. The thing is nice.
    The issue is clear. The issue is obvious. The issue is plain.
    The point is valid. The point is sound. The point is true.`;

    const result = evaluateAILikeness(repetitiveText);
    expect(result.signals.some((s) => s.name.includes('diversity'))).toBe(true);
  });

  it('should detect transition word overuse', () => {
    const transitionText = `Moreover, we can see. Furthermore, it is clear. Additionally, we can observe.
    In addition, it is important. Additionally, we must note. Furthermore, this is vital.
    Moreover, this is significant. Additionally, this matters. Furthermore, this is key.`;

    const result = evaluateAILikeness(transitionText);
    expect(result.signals.some((s) => s.name.includes('transition'))).toBe(true);
  });

  it('should return empty signals for very short text', () => {
    const shortText = 'Hello world.';
    const result = evaluateAILikeness(shortText);

    expect(result.score).toBeLessThan(50);
  });

  it('should handle empty text', () => {
    const result = evaluateAILikeness('');
    expect(result.score).toBe(0);
    expect(result.signals.length).toBe(0);
  });

  it('should generate meaningful explanations', () => {
    const text = `This is important. This is important. This is important. Furthermore, we must consider.
    Moreover, this is clear. Additionally, this is obvious. In conclusion, this is vital.`;

    const result = evaluateAILikeness(text);
    expect(result.explanation).toBeTruthy();
    expect(result.explanation.length).toBeGreaterThan(10);
  });

  it('should rank signals by severity and weight', () => {
    const aiText = `The system is good. The system is nice. The system is great. The system is useful.
    Furthermore, consideration is needed. Moreover, analysis is required. Additionally, planning is essential.`;

    const result = evaluateAILikeness(aiText);
    expect(result.signals.length).toBeGreaterThan(0);

    // Signals should be sorted by weight in descending order
    for (let i = 1; i < result.signals.length; i++) {
      expect(result.signals[i - 1].weight).toBeGreaterThanOrEqual(result.signals[i].weight);
    }
  });
});
