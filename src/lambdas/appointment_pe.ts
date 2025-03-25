import { SQSEvent } from "aws-lambda";
import { EventBridgeNotifier } from "../infraestructure/events/EventBridgeNotifier";
import { MysqlAppointmentPeRepository } from "../infraestructure/db/MysqlAppointmentRepository";

const repository = new MysqlAppointmentPeRepository();
const notifier = new EventBridgeNotifier();

export const main = async (event: SQSEvent) => {
  try {
    for (const record of event.Records) {
      const eventData = JSON.parse(record.body);
      const appointment = JSON.parse(eventData.Message);
      await repository.save(appointment);
      await notifier.notifyCompletion(appointment);
    }
    return { statusCode: 200, body: "Processing completed" };
  } catch (error) {
    console.error("Error processing appointment:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Processing failed" }),
    };
  }
};
