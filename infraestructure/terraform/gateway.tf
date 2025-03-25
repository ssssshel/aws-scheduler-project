# API Gateway configuration for the appointment service
resource "aws_api_gateway_rest_api" "appointment_api" {
  name        = "appointment_api"
  description = "API for appointments"
}

# Resource for appointments
resource "aws_api_gateway_resource" "appointments" {
  rest_api_id = aws_api_gateway_rest_api.appointment_api.id
  parent_id   = aws_api_gateway_rest_api.appointment_api.root_resource_id
  path_part   = "appointments"
}

# POST method for creating an appointment
resource "aws_api_gateway_method" "post_appointment" {
  rest_api_id   = aws_api_gateway_rest_api.appointment_api.id
  resource_id   = aws_api_gateway_resource.appointments.id
  http_method   = "POST"
  authorization = "NONE"
}

# Resource for retrieving an appointment by insured ID
resource "aws_api_gateway_resource" "appointment_by_insured" {
  rest_api_id = aws_api_gateway_rest_api.appointment_api.id
  parent_id   = aws_api_gateway_resource.appointments.id
  path_part   = "{insuredId}"
}

# GET method for fetching an appointment by insured ID
resource "aws_api_gateway_method" "get_appointment_by_insured" {
  rest_api_id   = aws_api_gateway_rest_api.appointment_api.id
  resource_id   = aws_api_gateway_resource.appointment_by_insured.id
  http_method   = "GET"
  authorization = "NONE"
}

# Allow API Gateway to invoke the Lambda function
resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.appointment.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.appointment_api.execution_arn}/*/*/*"
}

# Integration of POST method with the Lambda function
resource "aws_api_gateway_integration" "post_appointment" {
  rest_api_id             = aws_api_gateway_rest_api.appointment_api.id
  resource_id             = aws_api_gateway_resource.appointments.id
  http_method             = aws_api_gateway_method.post_appointment.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.appointment.invoke_arn
}

# Integration of GET method with the Lambda function
resource "aws_api_gateway_integration" "get_appointment_by_insured" {
  rest_api_id             = aws_api_gateway_rest_api.appointment_api.id
  resource_id             = aws_api_gateway_resource.appointment_by_insured.id
  http_method             = aws_api_gateway_method.get_appointment_by_insured.http_method
  integration_http_method = "GET"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.appointment.invoke_arn
}
