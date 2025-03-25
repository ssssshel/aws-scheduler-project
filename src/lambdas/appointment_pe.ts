import { SQSEvent } from "aws-lambda";
import { EventBridgeNotifier } from "../infraestructure/events/EventBridgeNotifier";
import { MysqlAppointmentPeRepository } from "../infraestructure/db/MysqlAppointmentRepository";

const repository = new MysqlAppointmentPeRepository();
const notifier = new EventBridgeNotifier();

/**
 * Processes SQS event records containing appointment details.
 *
 * For each record in the event, it parses the appointment details
 * from the message, saves the appointment to the repository, and
 * sends a completion notification via EventBridge.
 *
 * @param event - The SQS event containing records with appointment data.
 * @returns A promise resolving to an object with the HTTP status code
 *          and a message indicating the processing result.
 *          Returns 200 on success, or 500 if an error occurs.
 */

export const main = async (event: SQSEvent) => {
  try {
    for (const record of event.Records) {
      console.log("Processing record:", record);
      const eventData = JSON.parse(record.body);
      const appointment = JSON.parse(eventData.Message);
      await repository.save(appointment);
      await notifier.notifyCompletion(appointment);
    }
    console.log("Processing completed");
    return { statusCode: 200, body: "Processing completed" };
  } catch (error) {
    console.error("Error processing appointment:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Processing failed" }),
    };
  }
};
