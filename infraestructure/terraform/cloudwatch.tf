# EventBridge bus for appointment events
resource "aws_cloudwatch_event_bus" "appointment_bus" {
  name = "appointment_bus"
}

# Event rule for Chile (CL)
resource "aws_cloudwatch_event_rule" "appointment_completed_rule_cl" {
  name = "appointment_completed_rule_cl"
  event_bus_name = aws_cloudwatch_event_bus.appointment_bus.name
  event_pattern = jsonencode({
    source = ["appointment.service"]
    "detail-type" = ["AppointmentCompleted"]
    detail = {
      countryISO = ["CL"]
    }
  })
}

# Target for Chile, triggers the appointment_cl Lambda
resource "aws_cloudwatch_event_target" "eventbridge_to_lambda_cl" {
  rule = aws_cloudwatch_event_rule.appointment_completed_rule_cl.name
  event_bus_name = aws_cloudwatch_event_bus.appointment_bus.name
  arn = aws_lambda_function.appointment_cl.arn
}

# Event rule for Peru (PE)
resource "aws_cloudwatch_event_rule" "appointment_completed_rule_pe" {
  name = "appointment_completed_rule_pe"
  event_bus_name = aws_cloudwatch_event_bus.appointment_bus.name
  event_pattern = jsonencode({
    source = ["appointment.service"]
    "detail-type" = ["AppointmentCompleted"]
    detail = {
      countryISO = ["PE"]
    }
  })
}

# Target for Peru, triggers the appointment_pe Lambda
resource "aws_cloudwatch_event_target" "eventbridge_to_lambda_pe" {
  rule = aws_cloudwatch_event_rule.appointment_completed_rule_pe.name
  event_bus_name = aws_cloudwatch_event_bus.appointment_bus.name
  arn = aws_lambda_function.appointment_pe.arn
}
