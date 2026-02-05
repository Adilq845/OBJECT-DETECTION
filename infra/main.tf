provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_project_service" "required" {
  for_each = toset([
    "cloudfunctions.googleapis.com",
    "firestore.googleapis.com",
    "firebase.googleapis.com",
    "firebasehosting.googleapis.com",
    "bigquery.googleapis.com",
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com",
    "pubsub.googleapis.com"
  ])

  project = var.project_id
  service = each.value
}

resource "google_bigquery_dataset" "pr_reviewer" {
  dataset_id    = var.dataset_id
  friendly_name = "PR Reviewer Dataset"
  location      = "US"

  depends_on = [google_project_service.required]
}

resource "google_bigquery_table" "review_results" {
  dataset_id = google_bigquery_dataset.pr_reviewer.dataset_id
  table_id   = "review_results"

  schema = jsonencode([
    { name = "review_id", type = "STRING", mode = "REQUIRED" },
    { name = "pr_id", type = "STRING", mode = "REQUIRED" },
    { name = "repository", type = "STRING", mode = "REQUIRED" },
    { name = "status", type = "STRING", mode = "REQUIRED" },
    { name = "confidence", type = "FLOAT", mode = "REQUIRED" },
    { name = "notes", type = "STRING", mode = "NULLABLE" },
    { name = "rule_decision", type = "STRING", mode = "NULLABLE" },
    { name = "ai_decision", type = "STRING", mode = "NULLABLE" },
    { name = "created_at", type = "TIMESTAMP", mode = "REQUIRED" }
  ])
}

resource "google_project_iam_member" "functions_bigquery_editor" {
  project = var.project_id
  role    = "roles/bigquery.dataEditor"
  member  = "serviceAccount:${var.project_id}@appspot.gserviceaccount.com"

  depends_on = [google_project_service.required]
}
