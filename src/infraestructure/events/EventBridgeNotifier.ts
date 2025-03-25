import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";
import { Appointment } from "../../domain/models/Appointment";

export class EventBridgeNotifier {
  private client = new EventBridgeClient({});
  private eventBusName = process.env.EVENT_BUS_NAME!;

  async notifyCompletion(appointment: Appointment): Promise<void> {
    const command = new PutEventsCommand({
      Entries: [
        {
          EventBusName: this.eventBusName,
          Source: "appointment.service",
          DetailType: "AppointmentCompleted",
          Detail: JSON.stringify({
            insuredId: appointment.insuredId,
            scheduleId: appointment.scheduleId,
            countryISO: appointment.countryISO,
          }),
        },
      ],
    });

    try {
      await this.client.send(command);
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("An unknown error occurred");
    }
  }
}
