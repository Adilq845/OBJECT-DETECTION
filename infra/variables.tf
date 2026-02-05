variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "Primary region"
  type        = string
  default     = "us-central1"
}

variable "dataset_id" {
  description = "BigQuery dataset ID"
  type        = string
  default     = "pr_reviewer"
}
