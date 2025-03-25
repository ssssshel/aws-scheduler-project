import { RegisterAppointment } from "../../application/use-cases/RegisterAppointment";
import { GetAppointmentsByInsuredId } from "../../application/use-cases/GetAppointmentsByInsuredId";
import { AppointmentValidator } from "../validators/AppointmentValidator";
import { APIGatewayProxyEvent } from "aws-lambda";

export class AppointmentController {
  constructor(
    private registerAppointment: RegisterAppointment,
    private getAppointmentsByInsuredId: GetAppointmentsByInsuredId
  ) {}

  async register(eventBody: string | null) {
    try {
      if (!eventBody) {
        throw new Error("Missing event body");
      }
      console.log("eventBody", eventBody);
      const data = JSON.parse(eventBody);
      const validationError = AppointmentValidator.validate(data);
      if (validationError) {
        throw new Error(validationError);
      }

      await this.registerAppointment.execute(data);
      console.log("Appointment registered");
      return {
        statusCode: 201,
        body: JSON.stringify({ message: "Appointment registered" }),
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: (error as Error).message }),
      };
    }
  }

  async getAppointments(event: APIGatewayProxyEvent) {
    const { insuredId } = event.pathParameters || {};
    if (!insuredId) return { statusCode: 400, body: "Missing insuredId" };

    const appointments = await this.getAppointmentsByInsuredId.execute(
      insuredId
    );
    console.log("appointments", appointments);
    return { statusCode: 200, body: JSON.stringify(appointments) };
  }
}
