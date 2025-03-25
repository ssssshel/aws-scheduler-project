import { RegisterAppointment } from "../application/use-cases/RegisterAppointment";
import { DynamoDBAppointmentRepository } from "../infraestructure/db/DynamoDBAppointmentRepository";
import { SnsPublisher } from "../infraestructure/events/SnsPublisher";
import { GetAppointmentsByInsuredId } from "../application/use-cases/GetAppointmentsByInsuredId";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { AppointmentController } from "../infraestructure/controllers/AppointmentController";

const repository = new DynamoDBAppointmentRepository();
const snsPublisher = new SnsPublisher();
const registerAppointment = new RegisterAppointment(repository, snsPublisher);
const getAppointmentsByInsuredId = new GetAppointmentsByInsuredId(repository);
const appointmentController = new AppointmentController(
  registerAppointment,
  getAppointmentsByInsuredId
);

/**
 * Main entry point for the lambda function.
 *
 * Handles the following routes:
 *
 * - POST /appointments: Registers a new appointment.
 * - GET /appointments/{insuredId}: Retrieves the appointments for an insured.
 *
 * Returns a 404 error if the route is not recognized.
 *
 * @param {APIGatewayProxyEvent} event - The event object passed to the lambda function.
 * @returns {Promise<APIGatewayProxyResult>} - The response object.
 */
export const main = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (event.resource === "/appointments" && event.httpMethod === "POST") {
      return await appointmentController.register(event.body);
    }

    if (
      event.resource === "/appointments/{insuredId}" &&
      event.httpMethod === "GET"
    ) {
      return await appointmentController.getAppointments(event);
    }

    return { statusCode: 404, body: "Not Found" };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
