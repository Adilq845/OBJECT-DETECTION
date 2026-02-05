import test from 'node:test';
import assert from 'node:assert/strict';
import { runDeterministicRules } from './engine/rulesEngine.js';
import { crossVerify } from './engine/crossVerifier.js';

test('deterministic rules should request manual review for risky title', () => {
  const result = runDeterministicRules({
    prId: '1',
    repository: 'acme/repo',
    author: 'alice',
    title: 'security hotfix bypass for auth',
    description: 'This introduces temporary bypass logic for auth middleware.',
    attachments: [{ fileName: 'a.patch', sizeBytes: 1000, mimeType: 'text/x-diff' }]
  });

  assert.equal(result.decision, 'NEEDS_REVIEW');
  assert.ok(result.confidence < 0.7);
});

test('cross verifier forces manual review on disagreement', () => {
  const merged = crossVerify(
    { decision: 'AUTO_APPROVED', confidence: 0.92, notes: [] },
    { decision: 'NEEDS_REVIEW', confidence: 0.8, notes: [] }
  );

  assert.equal(merged.decision, 'NEEDS_REVIEW');
  assert.ok(merged.notes.some((note) => note.includes('diverged')));
});
