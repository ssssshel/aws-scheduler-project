import { SQSEvent } from "aws-lambda";
import { DynamoDBAppointmentRepository } from "../infraestructure/db/DynamoDBAppointmentRepository";

const repository = new DynamoDBAppointmentRepository();

export const main = async (event: SQSEvent) => {
  try {
    for (const record of event.Records) {
      const { insuredId, scheduleId } = JSON.parse(record.body);
      await repository.updateStatus(insuredId, scheduleId, "completed");
    }
    return { statusCode: 200, body: "Appointment updated" };
  } catch (error) {
    console.error("Error updating appointment status:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Update failed" }),
    };
  }
};
