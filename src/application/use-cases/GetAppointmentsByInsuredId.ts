import { AppointmentRepository } from "../../domain/repositories/AppointmentRepository";
import { Appointment } from "../../domain/models/Appointment";

export class GetAppointmentsByInsuredId {
  constructor(private repository: AppointmentRepository) {}

  async execute(insuredId: string): Promise<Appointment[]> {
    return this.repository.getByInsuredId(insuredId);
  }
}
