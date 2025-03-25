import { main } from "../../src/lambdas/appointment";
import { APIGatewayProxyEvent } from "aws-lambda";

jest.mock("../../src/infraestructure/controllers/AppointmentController", () => {
  const mockRegisterAppointment = jest.fn();
  const mockGetAppointmentsByInsuredId = jest.fn();

  return {
    AppointmentController: jest.fn().mockImplementation(() => ({
      register: mockRegisterAppointment,
      getAppointments: mockGetAppointmentsByInsuredId,
    })),
    __mocks__: {
      mockRegisterAppointment,
      mockGetAppointmentsByInsuredId,
    },
  };
});

const { __mocks__ } = jest.requireMock(
  "../../src/infraestructure/controllers/AppointmentController"
);
const { mockRegisterAppointment, mockGetAppointmentsByInsuredId } = __mocks__;

describe("Appointment", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Debe llamar a register cuando se haga una petición POST a /appointments", async () => {
    const event: APIGatewayProxyEvent = {
      resource: "/appointments",
      httpMethod: "POST",
      body: JSON.stringify({
        insuredId: "12345",
        scheduleId: 1,
        countryISO: "PE",
      }),
    } as any;

    mockRegisterAppointment.mockResolvedValue({
      statusCode: 201,
      body: JSON.stringify({ message: "Appointment created" }),
    });

    const response = await main(event);

    expect(mockRegisterAppointment).toHaveBeenCalledWith(event.body);
    expect(response.statusCode).toBe(201);
    expect(response.body).toBe(
      JSON.stringify({ message: "Appointment created" })
    );
  });

  test("Debe llamar a getAppointments cuando se haga una petición GET a /appointments/{insuredId}", async () => {
    const event: APIGatewayProxyEvent = {
      resource: "/appointments/{insuredId}",
      httpMethod: "GET",
      pathParameters: { insuredId: "123" },
    } as any;

    mockGetAppointmentsByInsuredId.mockResolvedValue({
      statusCode: 200,
      body: JSON.stringify([{ scheduleId: 1, status: "PENDING" }]),
    });

    const response = await main(event);

    expect(mockGetAppointmentsByInsuredId).toHaveBeenCalledWith(event);
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(
      JSON.stringify([{ scheduleId: 1, status: "PENDING" }])
    );
  });

  test("Debe devolver 404 si la ruta no es válida", async () => {
    const event: APIGatewayProxyEvent = {
      resource: "/invalid-route",
      httpMethod: "GET",
    } as any;

    const response = await main(event);

    expect(response.statusCode).toBe(404);
    expect(response.body).toBe("Not Found");
  });

  test("Debe devolver 500 si hay un error interno", async () => {
    const event: APIGatewayProxyEvent = {
      resource: "/appointments",
      httpMethod: "POST",
      body: JSON.stringify({ insuredId: "123", scheduleId: 1 }),
    } as any;

    mockRegisterAppointment.mockRejectedValue(new Error("Unexpected error"));

    const response = await main(event);

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({
      error: "Internal server error",
    });
  });
});
