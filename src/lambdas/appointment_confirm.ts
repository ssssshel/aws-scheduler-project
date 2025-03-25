import { SQSEvent } from "aws-lambda";
import { DynamoDBAppointmentRepository } from "../infraestructure/db/DynamoDBAppointmentRepository";
import { AppointmentStatus } from "../domain/enums/AppointmentStatus";

const repository = new DynamoDBAppointmentRepository();

/**
 * Processes SQS events and updates appointment status to COMPLETED.
 *
 * @param {SQSEvent} event - SQS event containing appointment details
 * @returns {Promise<APIGatewayProxyResult>}
 */
export const main = async (event: SQSEvent) => {
  try {
    for (const record of event.Records) {
      console.log("Processing record:", record);
      const eventData = JSON.parse(record.body);
      const appointment = eventData.detail;
      await repository.updateStatus({
        ...appointment,
        status: AppointmentStatus.COMPLETED,
      });
    }
    console.log("Processing completed");
    return { statusCode: 200, body: "Appointment updated" };
  } catch (error) {
    console.error("Error updating appointment status:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Update failed" }),
    };
  }
};
