import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { Appointment } from "../../domain/models/Appointment";

export class SnsPublisher {
  private client = new SNSClient({});
  private topicArn = process.env.SNS_TOPIC_ARN;

  async publish(appointment: Appointment): Promise<void> {
    if (!this.topicArn) {
      throw new Error("SNS_TOPIC_ARN is not defined");
    }

    const command = new PublishCommand({
      TopicArn: this.topicArn,
      Message: JSON.stringify(appointment),
      MessageAttributes: {
        countryISO: { DataType: "String", StringValue: appointment.countryISO },
      },
    });

    try {
      await this.client.send(command);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unknown error occurred");
    }
  }
}
