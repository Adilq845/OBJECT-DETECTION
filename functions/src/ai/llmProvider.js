import { ReviewDecision } from '../models/types.js';

function hashString(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export async function reviewWithMockProvider(pr) {
  const seed = hashString(`${pr.prId}:${pr.title}:${pr.description}`);
  const confidence = 0.55 + (seed % 45) / 100;
  const decision = confidence >= 0.75 ? ReviewDecision.AUTO_APPROVED : ReviewDecision.NEEDS_REVIEW;

  const notes = [
    `Mock model evaluated ${pr.attachments.length} attachment(s).`,
    decision === ReviewDecision.AUTO_APPROVED
      ? 'No severe semantic issues detected from attachment metadata.'
      : 'Potentially risky change profile; recommend human verification.'
  ];

  return {
    provider: process.env.LLM_PROVIDER || 'mock',
    decision,
    confidence: Math.min(confidence, 0.99),
    notes
  };
}
