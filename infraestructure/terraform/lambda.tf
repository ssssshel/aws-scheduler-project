# IAM Role for Lambda execution
resource "aws_iam_role" "lambda_role" {
  name = "lambda_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

# IAM Policy for Lambda permissions
resource "aws_iam_policy" "lambda_policy" {
  name        = "lambda_policy"
  description = "IAM policy for Lambda functions"
  policy      = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = ["dynamodb:PutItem", "dynamodb:GetItem", "dynamodb:UpdateItem"],
        Resource = [aws_dynamodb_table.appointments.arn]
      },
      {
        Effect = "Allow",
        Action = ["sns:Publish"],
        Resource = [aws_sns_topic.appointment_topic.arn]
      },
      {
        Effect = "Allow",
        Action = ["sqs:ReceiveMessage", "sqs:DeleteMessage"],
        Resource = [aws_sqs_queue.sqs_pe.arn, aws_sqs_queue.sqs_cl.arn]
      },
      {
        Effect = "Allow",
        Action = ["events:PutEvents"],
        Resource = [aws_cloudwatch_event_bus.appointment_bus.arn]
      }
    ]
  })
}

# Attach IAM policy to the Lambda role
resource "aws_iam_role_policy_attachment" "lambda_policy_attachment" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_policy.arn
}

# Lambda function for general appointment processing
resource "aws_lambda_function" "appointment" {
  function_name = "appointment"
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  role          = aws_iam_role.lambda_role.arn
  filename      = "./lambdas/appointment.zip"
  environment {
    variables = {
      SNS_TOPIC_ARN = aws_sns_topic.appointment_topic.arn
    }
  }
}

# Lambda function for handling appointments in Peru
resource "aws_lambda_function" "appointment_pe" {
  function_name = "appointment_pe"
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  role          = aws_iam_role.lambda_role.arn
  filename      = "./lambdas/appointment_pe.zip"
  environment {
    variables = {
      SQS_URL = aws_sqs_queue.sqs_pe.url
    }
  }
}

# Lambda function for handling appointments in Chile
resource "aws_lambda_function" "appointment_cl" {
  function_name = "appointment_cl"
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  role          = aws_iam_role.lambda_role.arn
  filename      = "./lambdas/appointment_cl.zip"
  environment {
    variables = {
      SQS_URL = aws_sqs_queue.sqs_cl.url
    }
  }
}

# Lambda function for confirming appointments
resource "aws_lambda_function" "appointment_confirm" {
  function_name = "appointment_confirm"
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  role          = aws_iam_role.lambda_role.arn
  filename      = "./lambdas/appointment_confirm.zip"
  environment {
    variables = {
      SQS_URL = aws_sqs_queue.sqs_appointment_confirm.url
    }
  }
}

# Event source mapping for Peru SQS queue
resource "aws_lambda_event_source_mapping" "appointment_pe_sqs" {
  event_source_arn = aws_sqs_queue.sqs_pe.arn
  function_name    = aws_lambda_function.appointment_pe.arn
  batch_size       = 5
}

# Event source mapping for Chile SQS queue
resource "aws_lambda_event_source_mapping" "appointment_cl_sqs" {
  event_source_arn = aws_sqs_queue.sqs_cl.arn
  function_name    = aws_lambda_function.appointment_cl.arn
  batch_size       = 5
}

# Event source mapping for appointment confirmation SQS queue
resource "aws_lambda_event_source_mapping" "appointment_confirm_sqs" {
  event_source_arn = aws_sqs_queue.sqs_appointment_confirm.arn
  function_name    = aws_lambda_function.appointment_confirm.arn
  batch_size       = 5
}

# IAM Policy for Lambda to read from SQS
resource "aws_iam_policy" "sqs_read_policy" {
  name        = "sqs_read_policy"
  description = "Policy for Lambda to read from SQS"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = [
          aws_sqs_queue.sqs_pe.arn,
          aws_sqs_queue.sqs_cl.arn,
          aws_sqs_queue.sqs_appointment_confirm.arn
        ]
      }
    ]
  })
}

# Attach SQS read policy to Lambda role
resource "aws_iam_role_policy_attachment" "sqs_lambda_attach" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.sqs_read_policy.arn
}

# IAM Policy for Lambda to write to DynamoDB
resource "aws_iam_policy" "dynamodb_write_policy" {
  name        = "dynamodb_write_policy"
  description = "Policy for Lambda to write to DynamoDB"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = [
          "dynamodb:UpdateItem",
          "dynamodb:GetItem"
        ]
        Resource = aws_dynamodb_table.appointments.arn
      }
    ]
  })
}

# Attach DynamoDB write policy to Lambda role
resource "aws_iam_role_policy_attachment" "dynamodb_lambda_attach" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.dynamodb_write_policy.arn
}
