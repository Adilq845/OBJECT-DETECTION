import { ReviewDecision } from '../models/types.js';

export function crossVerify(ruleResult, aiResult) {
  const confidence = Number(((ruleResult.confidence + aiResult.confidence) / 2).toFixed(2));

  const disagreement = ruleResult.decision !== aiResult.decision;
  const decision = disagreement
    ? ReviewDecision.NEEDS_REVIEW
    : confidence >= 0.72
      ? ReviewDecision.AUTO_APPROVED
      : ReviewDecision.NEEDS_REVIEW;

  const notes = [
    ...ruleResult.notes,
    ...aiResult.notes,
    disagreement ? 'Rule and AI decisions diverged; forcing manual review.' : 'Rule and AI decisions aligned.'
  ];

  return {
    decision,
    confidence,
    notes,
    evidence: {
      ruleDecision: ruleResult.decision,
      aiDecision: aiResult.decision
    }
  };
}
