export class Appointment {
  constructor(
    public insuredId: string,
    public scheduleId: number,
    public countryISO: "PE" | "CL",
    public status: "pending" | "completed"
  ) {}
}
