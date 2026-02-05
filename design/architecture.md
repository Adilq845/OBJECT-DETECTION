# PR Reviewer AI Architecture

## Components

1. **Event Ingestion**
   - Firestore `prUploads/{uploadId}` document creation acts as the simulated Pub/Sub event.
   - Optional API endpoint writes the same event for easier integration tests.

2. **Review Pipeline**
   - `parsePrPayload` validates and normalizes input.
   - `runDeterministicRules` checks file size limits, risky keywords, and metadata completeness.
   - `aiReviewer.review` invokes a provider abstraction (mock/OpenAI/Gemini shape).
   - `crossVerify` merges deterministic + AI outputs into final decision and confidence.

3. **Persistence Layer**
   - Firestore `prs/{prId}` stores latest status view for UI.
   - Firestore `reviews/{reviewId}` stores immutable review events.
   - BigQuery `pr_reviewer.review_results` stores analytics-ready records.

4. **Presentation Layer**
   - React dashboard lists PRs with status badges and confidence.
   - PR detail page shows reviewer notes and evidence trail.

## Decision Labels

- `AUTO_APPROVED`
- `NEEDS_REVIEW`

## Reliability

- Input payload schema validated on ingress.
- Review pipeline idempotent by deterministic `reviewId` derivation from upload id.
- BigQuery insertion failures are logged and surfaced to Firestore as warnings for observability.
