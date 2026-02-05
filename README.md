# PR Reviewer AI on Firebase + GCP

A production-ready web application that ingests PR attachments, runs deterministic and AI-based review checks, cross-verifies outcomes, and publishes a final review decision to Firestore and BigQuery.

## Architecture

- **Frontend (`/frontend`)**: React + Vite single-page app deployed to Firebase Hosting.
- **Backend (`/functions`)**: Firebase Cloud Functions (Node.js 20) with Express API endpoints and Firestore trigger.
- **Data stores**:
  - Firestore for operational state (`prs`, `reviews`, `prUploads`).
  - BigQuery for analytics (`pr_reviewer.review_results`).
- **Infrastructure (`/infra`)**: Terraform for GCP services, BigQuery dataset/table, and function service account role binding.

## End-to-end Flow

1. A PR attachment upload event is simulated by writing to Firestore collection `prUploads` or by calling `/api/simulate-upload`.
2. Cloud Function trigger `onPrAttachmentUploaded` parses PR metadata.
3. Deterministic rules engine evaluates objective checks.
4. AI reviewer adapter (mocked provider) returns recommendation + confidence.
5. Cross-verifier combines both results into a final decision.
6. Results are written to:
   - Firestore collections `prs` and `reviews`
   - BigQuery table `pr_reviewer.review_results`
7. Frontend dashboard renders status badges and confidence for each PR.

## Repository Layout

```
.firebase/
.github/workflows/
design/
frontend/
functions/
infra/
AGENTS.md
README.md
firebase.json
.firebaserc
firestore.rules
firestore.indexes.json
storage.rules
.gitignore
```

## Local Development

### Prerequisites
- Node.js 20+
- Firebase CLI
- GCP project with billing enabled (for BigQuery)

### Install

```bash
npm --prefix functions install
npm --prefix frontend install
```

### Run frontend

```bash
npm --prefix frontend run dev
```

### Run Firebase emulators

```bash
firebase emulators:start
```

## Deploy

### 1) Provision infra

```bash
cd infra
terraform init
terraform apply -var="project_id=<your-gcp-project-id>" -var="region=us-central1"
```

### 2) Deploy app

```bash
npm --prefix frontend run build
firebase deploy
```

## API Endpoints

- `POST /api/submit-pr-review` : submit PR payload and receive review result.
- `POST /api/simulate-upload` : simulates Pub/Sub-style attachment upload by creating a Firestore `prUploads` document.
- `GET /api/healthz` : health check.

## Security Notes

- Firestore rules require authenticated writes.
- BigQuery insertions are server-side only through Cloud Functions.
- LLM provider credentials are expected via function environment config.

## Example payload (`POST /api/submit-pr-review`)

```json
{
  "prId": "1234",
  "repository": "acme/payment-service",
  "author": "jdoe",
  "title": "Fix race condition in webhook handler",
  "description": "Adds lock around idempotency key writes",
  "attachments": [
    {
      "fileName": "diff.patch",
      "sizeBytes": 18920,
      "mimeType": "text/x-diff"
    }
  ]
}
```
