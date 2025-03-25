# SQS Queues for different countries
resource "aws_sqs_queue" "sqs_pe" {
  name = "sqs_pe"
  message_retention_seconds = 86400 # Messages are retained for 24 hours
}

resource "aws_sqs_queue" "sqs_cl" {
  name = "sqs_cl"
  message_retention_seconds = 86400 # Messages are retained for 24 hours
}

# Queue policies to allow SNS to send messages
resource "aws_sqs_queue_policy" "sqs_pe_policy" {
  queue_url = aws_sqs_queue.sqs_pe.id
  policy    = data.aws_iam_policy_document.sqs_pe_policy.json
}

resource "aws_sqs_queue_policy" "sqs_cl_policy" {
  queue_url = aws_sqs_queue.sqs_cl.id
  policy    = data.aws_iam_policy_document.sqs_cl_policy.json
}

# IAM policy allowing SNS to publish messages to the PE queue
data "aws_iam_policy_document" "sqs_pe_policy" {
  statement {
    effect = "allow"
    principals {
      type        = "AWS"
      identifiers = ["*"] # Open to all AWS services, controlled by condition
    }
    actions = [
      "sqs:SendMessage",
    ]
    resources = [
      aws_sqs_queue.sqs_pe.arn,
    ]
    condition {
      test     = "StringEquals"
      variable = "aws:SourceArn"
      values = [
        aws_sns_topic.appointment_topic.arn # Restricts publishing to the SNS topic
      ]
    }
  }
}

# IAM policy allowing SNS to publish messages to the CL queue
data "aws_iam_policy_document" "sqs_cl_policy" {
  statement {
    effect = "allow"
    principals {
      type        = "AWS"
      identifiers = ["*"] # Open to all AWS services, controlled by condition
    }
    actions = [
      "sqs:SendMessage",
    ]
    resources = [
      aws_sqs_queue.sqs_cl.arn,
    ]
    condition {
      test     = "StringEquals"
      variable = "aws:SourceArn"
      values = [
        aws_sns_topic.appointment_topic.arn # Restricts publishing to the SNS topic
      ]
    }
  }
}

# SQS queue for appointment confirmations
resource "aws_sqs_queue" "sqs_appointment_confirm" {
  name = "sqs_appointment_confirm"
}
