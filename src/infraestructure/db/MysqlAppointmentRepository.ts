import { createPool, Pool } from "mysql2/promise";
import { AppointmentRepository } from "../../domain/repositories/AppointmentRepository";
import { Appointment } from "../../domain/models/Appointment";

abstract class BaseMysqlAppointmentRepository
  implements Pick<AppointmentRepository, "save">
{
  protected pool: Pool;

  constructor(dbConfig: {
    host: string;
    user: string;
    password: string;
    database: string;
  }) {
    this.pool = createPool(dbConfig);
  }

  /**
   * Saves an appointment to the database.
   *
   * @param appointment - The appointment to save
   * @throws {Error} If an error occurs while saving the appointment
   */
  async save(appointment: Appointment): Promise<void> {
    const sql =
      "INSERT INTO appointments (insured_id, schedule_id, country_iso, status) VALUES (?, ?, ?, ?)";
    try {
      await this.pool.execute(sql, [
        appointment.insuredId,
        appointment.scheduleId,
        appointment.countryISO,
        appointment.status,
      ]);
      console.log("Record saved");
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("An unknown error occurred");
    }
  }
}

export class MysqlAppointmentClRepository extends BaseMysqlAppointmentRepository {
  constructor() {
    super({
      host: process.env.CL_DB_HOST!,
      user: process.env.CL_DB_USER!,
      password: process.env.CL_DB_PASSWORD!,
      database: process.env.CL_DB_NAME!,
    });
  }
}

export class MysqlAppointmentPeRepository extends BaseMysqlAppointmentRepository {
  constructor() {
    super({
      host: process.env.PE_DB_HOST!,
      user: process.env.PE_DB_USER!,
      password: process.env.PE_DB_PASSWORD!,
      database: process.env.PE_DB_NAME!,
    });
  }
}
