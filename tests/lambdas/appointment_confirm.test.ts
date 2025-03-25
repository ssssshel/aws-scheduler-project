import { main } from "../../src/lambdas/appointment_confirm";
import { SQSEvent } from "aws-lambda";
import { DynamoDBAppointmentRepository } from "../../src/infraestructure/db/DynamoDBAppointmentRepository";
import { AppointmentStatus } from "../../src/domain/enums/AppointmentStatus";

// Mock de la dependencia
jest.mock("../../src/infraestructure/db/DynamoDBAppointmentRepository");

// Instancia mockeada
const mockUpdateStatus = jest.fn();
DynamoDBAppointmentRepository.prototype.updateStatus = mockUpdateStatus;

describe("SQS Event Processor - Update Appointment Status", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Debe actualizar el estado de la cita a COMPLETED", async () => {
    const event: SQSEvent = {
      Records: [
        {
          body: JSON.stringify({
            detail: {
              appointmentId: "A123",
              insuredId: "12345",
              scheduleId: 1,
              countryISO: "PE",
            },
          }),
        },
      ],
    } as any;

    // Simulación de respuesta exitosa
    mockUpdateStatus.mockResolvedValue(undefined);

    const response = await main(event);

    expect(mockUpdateStatus).toHaveBeenCalledWith({
      appointmentId: "A123",
      insuredId: "12345",
      scheduleId: 1,
      countryISO: "PE",
      status: AppointmentStatus.COMPLETED,
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("Appointment updated");
  });

  test("Debe manejar errores y devolver un código 500", async () => {
    const event: SQSEvent = {
      Records: [
        {
          body: JSON.stringify({
            detail: {
              appointmentId: "A123",
              insuredId: "12345",
              scheduleId: 1,
              countryISO: "PE",
            },
          }),
        },
      ],
    } as any;

    mockUpdateStatus.mockRejectedValue(new Error("DynamoDB error"));

    const response = await main(event);

    expect(mockUpdateStatus).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({
      error: "Update failed",
    });
  });
});
