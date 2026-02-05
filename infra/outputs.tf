output "bigquery_dataset_id" {
  value       = google_bigquery_dataset.pr_reviewer.dataset_id
  description = "Dataset ID for PR review analytics"
}

output "bigquery_table_id" {
  value       = google_bigquery_table.review_results.table_id
  description = "BigQuery table for persisted review results"
}
