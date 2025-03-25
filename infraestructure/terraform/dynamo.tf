# DynamoDB
resource "aws_dynamodb_table" "appointments" {
  name         = "appointments"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "scheduleId"

  attribute {
    name = "scheduleId"
    type = "S"
  }
}