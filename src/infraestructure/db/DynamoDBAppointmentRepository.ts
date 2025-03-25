import {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { AppointmentRepository } from "../../domain/repositories/AppointmentRepository";
import { Appointment } from "../../domain/models/Appointment";

export class DynamoDBAppointmentRepository implements AppointmentRepository {
  private client = new DynamoDBClient({});
  private tableName = process.env.DYNAMODB_TABLE_NAME!;

  async save(appointment: Appointment): Promise<void> {
    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: {
        scheduleId: { N: appointment.scheduleId.toString() },
        insuredId: { S: appointment.insuredId },
        countryISO: { S: appointment.countryISO },
        status: { S: appointment.status },
      },
      ConditionExpression: "attribute_not_exists(scheduleId)",
    });

    try {
      await this.client.send(command);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "ConditionalCheckFailedException") {
          throw new Error("Appointment with this scheduleId already exists");
        }
        throw error;
      }
      throw new Error("An unknown error occurred");
    }
  }

  async updateStatus(
    insuredId: string,
    scheduleId: number,
    status: string
  ): Promise<void> {
    const command = new UpdateItemCommand({
      TableName: this.tableName,
      Key: {
        insuredId: { S: insuredId },
        scheduleId: { N: scheduleId.toString() },
      },
      UpdateExpression: "SET #status = :status",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: { ":status": { S: status } },
    });
    await this.client.send(command);
  }

  async getByInsuredId(insuredId: string): Promise<Appointment[]> {
    const command = new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: "insuredId = :insuredId",
      ExpressionAttributeValues: { ":insuredId": { S: insuredId } },
    });
    const result = await this.client.send(command);
    return (
      result.Items?.map(
        (item) =>
          new Appointment(
            item.insuredId.S!,
            parseInt(item.scheduleId.N!),
            item.countryISO.S! as "PE" | "CL",
            item.status.S! as "pending" | "completed"
          )
      ) || []
    );
  }
}
