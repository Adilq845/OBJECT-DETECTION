# AGENTS

This repository uses a multi-agent ownership model to keep delivery quality high.

## 1) `frontend-agent`
- Owns all files in `/frontend`.
- Responsible for React UI, UX consistency, accessibility labels, and client-side Firebase integration.
- Guarantees dashboard and detail pages render PR status, confidence, and reviewer notes.

## 2) `backend-agent`
- Owns all files in `/functions`.
- Responsible for ingestion of PR attachment events, deterministic review rules, pluggable LLM calls, cross-verification, and persistence.
- Maintains secure, typed, and testable Cloud Functions code.

## 3) `infra-agent`
- Owns all files in `/infra` and Firebase config files in repository root.
- Responsible for GCP APIs, BigQuery dataset/table provisioning, IAM bindings, and deployment pipeline support.

## 4) `docs-agent`
- Owns `/README.md` and `/design` docs.
- Responsible for architecture diagrams, operational playbooks, and deployment/runbook quality.

## Collaboration Rules
- Any cross-cutting change requires updating impacted docs in `/design`.
- Backend schema changes require matching updates in frontend TypeScript interfaces.
- Terraform table schema and Cloud Functions payloads must stay aligned.
