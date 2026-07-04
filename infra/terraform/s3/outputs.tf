output "bucket_name" {
  description = "Created S3 bucket name."
  value       = aws_s3_bucket.this.bucket
}

output "bucket_arn" {
  description = "Created S3 bucket ARN."
  value       = aws_s3_bucket.this.arn
}

output "bucket_region" {
  description = "AWS region configured for this bucket."
  value       = var.aws_region
}
