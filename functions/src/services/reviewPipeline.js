import admin from 'firebase-admin';
import { runDeterministicRules } from '../engine/rulesEngine.js';
import { reviewWithMockProvider } from '../ai/llmProvider.js';
import { crossVerify } from '../engine/crossVerifier.js';
import { writeReviewToBigQuery } from './bigQueryService.js';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

function validatePrPayload(payload) {
  const required = ['prId', 'repository', 'author', 'title', 'description', 'attachments'];
  for (const key of required) {
    if (!(key in payload)) {
      throw new Error(`Missing required field: ${key}`);
    }
  }

  if (!Array.isArray(payload.attachments)) {
    throw new Error('attachments must be an array');
  }

  payload.attachments.forEach((a, idx) => {
    if (!a.fileName || typeof a.sizeBytes !== 'number' || !a.mimeType) {
      throw new Error(`Invalid attachment at index ${idx}`);
    }
  });

  return payload;
}

export async function processPrReview(payload, sourceId = 'manual') {
  const pr = validatePrPayload(payload);
  const rules = runDeterministicRules(pr);
  const ai = await reviewWithMockProvider(pr);
  const finalResult = crossVerify(rules, ai);
  const now = new Date().toISOString();

  const reviewId = `${pr.prId}-${sourceId}`;
  const reviewRecord = {
    reviewId,
    prId: pr.prId,
    repository: pr.repository,
    author: pr.author,
    title: pr.title,
    status: finalResult.decision,
    confidence: finalResult.confidence,
    notes: finalResult.notes,
    evidence: finalResult.evidence,
    createdAt: now,
    sourceId
  };

  await db.collection('prs').doc(pr.prId).set(
    {
      ...reviewRecord,
      updatedAt: now
    },
    { merge: true }
  );

  await db.collection('reviews').doc(reviewId).set(reviewRecord, { merge: true });

  try {
    await writeReviewToBigQuery(reviewRecord);
  } catch (err) {
    await db.collection('reviews').doc(reviewId).set(
      {
        bqWarning: err.message
      },
      { merge: true }
    );
  }

  return reviewRecord;
}
