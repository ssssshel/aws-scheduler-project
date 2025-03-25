import { main } from "../../src/lambdas/appointment_cl";
import { SQSEvent } from "aws-lambda";
import { MysqlAppointmentPeRepository } from "../../src/infraestructure/db/MysqlAppointmentRepository";
import { EventBridgeNotifier } from "../../src/infraestructure/events/EventBridgeNotifier";

// Mock de dependencias
jest.mock("../../src/infraestructure/db/MysqlAppointmentRepository");
jest.mock("../../src/infraestructure/events/EventBridgeNotifier");

// Instancias mockeadas
const mockSave = jest.fn();
const mockNotifyCompletion = jest.fn();

MysqlAppointmentPeRepository.prototype.save = mockSave;
EventBridgeNotifier.prototype.notifyCompletion = mockNotifyCompletion;

describe("AppointmentCL", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Debe procesar correctamente los mensajes de SQS", async () => {
    const event: SQSEvent = {
      Records: [
        {
          body: JSON.stringify({
            Message: JSON.stringify({
              insuredId: "12345",
              scheduleId: 1,
              countryISO: "CL",
            }),
          }),
        },
      ],
    } as any;

    // Simulación de respuestas exitosas
    mockSave.mockResolvedValue(undefined);
    mockNotifyCompletion.mockResolvedValue(undefined);

    const response = await main(event);

    expect(mockSave).toHaveBeenCalledWith({
      insuredId: "12345",
      scheduleId: 1,
      countryISO: "CL",
    });
    expect(mockNotifyCompletion).toHaveBeenCalledWith({
      insuredId: "12345",
      scheduleId: 1,
      countryISO: "CL",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("Processing completed");
  });

  test("Debe manejar errores y devolver un código 500", async () => {
    const event: SQSEvent = {
      Records: [
        {
          body: JSON.stringify({
            Message: JSON.stringify({
              insuredId: "12345",
              scheduleId: 1,
              countryISO: "CL",
            }),
          }),
        },
      ],
    } as any;

    mockSave.mockRejectedValue(new Error("Database error"));

    const response = await main(event);

    expect(mockSave).toHaveBeenCalled();
    expect(mockNotifyCompletion).not.toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({
      error: "Processing failed",
    });
  });
});
