import { AppointmentStatus } from "../enums/AppointmentStatus";
import { CountryISO } from "../enums/CountryISO";

export class Appointment {
  constructor(
    public insuredId: string,
    public scheduleId: number,
    public countryISO: CountryISO,
    public status: AppointmentStatus
  ) {}
}
