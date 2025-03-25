import { AppointmentStatus } from "../../domain/enums/AppointmentStatus";
import { Appointment } from "../../domain/models/Appointment";
import { AppointmentRepository } from "../../domain/repositories/AppointmentRepository";
import { SnsPublisher } from "../../infraestructure/events/SnsPublisher";

export class RegisterAppointment {
  constructor(
    private repository: AppointmentRepository,
    private publisher: SnsPublisher
  ) {}

  async execute(data: Appointment): Promise<void> {
    const appointment = new Appointment(
      data.insuredId,
      data.scheduleId,
      data.countryISO,
      AppointmentStatus.PENDING
    );
    await this.repository.save(appointment);
    await this.publisher.publish(appointment);
  }
}
