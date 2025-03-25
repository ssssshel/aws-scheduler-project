# SNS Topic for appointment notifications
resource "aws_sns_topic" "appointment_topic" {
  name = "appointment_topic"
}

# Subscription for Peru (PE) - Messages with countryISO "PE" are sent to sqs_pe
resource "aws_sns_topic_subscription" "sns_pe_subscription" {
  topic_arn = aws_sns_topic.appointment_topic.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.sqs_pe.arn

  filter_policy = jsonencode({
    countryISO = ["PE"]
  })
}

# Subscription for Chile (CL) - Messages with countryISO "CL" are sent to sqs_cl
resource "aws_sns_topic_subscription" "sns_cl_subscription" {
  topic_arn = aws_sns_topic.appointment_topic.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.sqs_cl.arn

  filter_policy = jsonencode({
    countryISO = ["CL"]
  })
}