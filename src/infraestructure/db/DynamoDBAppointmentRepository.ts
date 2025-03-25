import {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { AppointmentRepository } from "../../domain/repositories/AppointmentRepository";
import { Appointment } from "../../domain/models/Appointment";
import { AppointmentStatus } from "../../domain/enums/AppointmentStatus";
import { CountryISO } from "../../domain/enums/CountryISO";

export class DynamoDBAppointmentRepository implements AppointmentRepository {
  private client = new DynamoDBClient({});
  private tableName = process.env.DYNAMODB_TABLE_NAME!;

  async save(appointment: Appointment): Promise<void> {
    const queryCommand = new QueryCommand({
      TableName: this.tableName,
      IndexName: "ScheduleIdIndex",
      KeyConditionExpression: "scheduleId = :scheduleId",
      ExpressionAttributeValues: {
        ":scheduleId": { N: appointment.scheduleId.toString() },
      },
    });

    const result = await this.client.send(queryCommand);
    if (result.Items && result.Items.length > 0) {
      throw new Error("Appointment with this scheduleId already exists");
    }

    const putCommand = new PutItemCommand({
      TableName: this.tableName,
      Item: {
        scheduleId: { N: appointment.scheduleId.toString() },
        insuredId: { S: appointment.insuredId },
        countryISO: { S: appointment.countryISO },
        status: { S: appointment.status },
      },
    });

    await this.client.send(putCommand);
  }

  async updateStatus({
    insuredId,
    scheduleId,
    status,
  }: Appointment): Promise<void> {
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

    try {
      await this.client.send(command);
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("An unknown error occurred");
    }
  }

  async getByInsuredId(insuredId: string): Promise<Appointment[]> {
    const command = new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: "insuredId = :insuredId",
      ExpressionAttributeValues: { ":insuredId": { S: insuredId } },
    });

    try {
      const result = await this.client.send(command);
      return (
        result.Items?.map(
          (item) =>
            new Appointment(
              item.insuredId.S!,
              parseInt(item.scheduleId.N!),
              item.countryISO.S! as CountryISO,
              item.status.S! as AppointmentStatus
            )
        ) || []
      );
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("An unknown error occurred");
    }
  }
}
