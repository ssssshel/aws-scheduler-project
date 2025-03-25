import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";
import { Appointment } from "../../domain/models/Appointment";

export class EventBridgeNotifier {
  private client = new EventBridgeClient({});
  private eventBusName = process.env.EVENT_BUS_NAME!;

  /**
   * Sends an event to the EventBridge to notify that an appointment has been completed.
   *
   * @param appointment - The appointment object containing details like insuredId, scheduleId, and countryISO.
   * @throws {Error} If there is an error while sending the event to EventBridge.
   */

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
