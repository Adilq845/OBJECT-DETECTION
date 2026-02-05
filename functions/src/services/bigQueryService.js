import { BigQuery } from '@google-cloud/bigquery';

const bigquery = new BigQuery();
const DATASET = process.env.BQ_DATASET || 'pr_reviewer';
const TABLE = process.env.BQ_TABLE || 'review_results';

export async function writeReviewToBigQuery(reviewRecord) {
  const row = {
    review_id: reviewRecord.reviewId,
    pr_id: reviewRecord.prId,
    repository: reviewRecord.repository,
    status: reviewRecord.status,
    confidence: reviewRecord.confidence,
    notes: reviewRecord.notes.join(' | '),
    rule_decision: reviewRecord.evidence.ruleDecision,
    ai_decision: reviewRecord.evidence.aiDecision,
    created_at: reviewRecord.createdAt
  };

  await bigquery.dataset(DATASET).table(TABLE).insert([row]);
}
