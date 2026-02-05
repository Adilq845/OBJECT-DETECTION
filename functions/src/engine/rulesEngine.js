import { ReviewDecision } from '../models/types.js';

const RISKY_KEYWORDS = ['hotfix', 'security', 'bypass', 'temporary'];

export function runDeterministicRules(pr) {
  const notes = [];
  let score = 1;

  if (!pr.title || pr.title.length < 10) {
    notes.push('Title is too short for reliable automated review.');
    score -= 0.25;
  }

  if (!pr.description || pr.description.length < 20) {
    notes.push('Description lacks implementation detail.');
    score -= 0.2;
  }

  const oversized = pr.attachments.some((a) => a.sizeBytes > 500_000);
  if (oversized) {
    notes.push('One or more attachments exceed 500KB.');
    score -= 0.2;
  }

  const hasRiskyKeyword = RISKY_KEYWORDS.some((keyword) => {
    const combined = `${pr.title} ${pr.description}`.toLowerCase();
    return combined.includes(keyword);
  });

  if (hasRiskyKeyword) {
    notes.push('Risky change keyword detected and requires manual review.');
    score -= 0.35;
  }

  const confidence = Math.max(0, Math.min(score, 1));
  const decision = confidence >= 0.7 ? ReviewDecision.AUTO_APPROVED : ReviewDecision.NEEDS_REVIEW;

  return {
    engine: 'deterministic-rules-v1',
    decision,
    confidence,
    notes
  };
}
