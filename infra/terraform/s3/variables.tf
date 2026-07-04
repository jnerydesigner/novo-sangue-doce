variable "aws_region" {
  description = "AWS region where the S3 bucket will be created."
  type        = string
  default     = "us-east-1"
}

variable "bucket_name" {
  description = "Globally unique S3 bucket name."
  type        = string
}

variable "environment" {
  description = "Environment name used for resource tags."
  type        = string
  default     = "prod"
}

variable "force_destroy" {
  description = "Allow Terraform to delete the bucket even when it contains objects."
  type        = bool
  default     = false
}

variable "enable_cors" {
  description = "Enable browser uploads/downloads from allowed origins."
  type        = bool
  default     = false
}

variable "enable_public_read" {
  description = "Allow public read access to objects in the bucket."
  type        = bool
  default     = false
}

variable "cors_allowed_origins" {
  description = "Origins allowed by the S3 CORS rule when enable_cors is true."
  type        = list(string)
  default     = []
}
