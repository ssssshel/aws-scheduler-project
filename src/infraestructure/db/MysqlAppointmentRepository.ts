import { createPool, Pool } from "mysql2/promise";
import { AppointmentRepository } from "../../domain/repositories/AppointmentRepository";
import { Appointment } from "../../domain/models/Appointment";

abstract class BaseMysqlAppointmentRepository implements AppointmentRepository {
  protected pool: Pool;

  constructor(dbConfig: {
    host: string;
    user: string;
    password: string;
    database: string;
  }) {
    this.pool = createPool(dbConfig);
  }

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
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("An unknown error occurred");
    }
  }

  async updateStatus(
    insuredId: string,
    scheduleId: number,
    status: string
  ): Promise<void> {
    const sql =
      "UPDATE appointments SET status = ? WHERE insured_id = ? AND schedule_id = ?";
    try {
      await this.pool.execute(sql, [status, insuredId, scheduleId]);
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("An unknown error occurred");
    }
  }

  async getByInsuredId(insuredId: string): Promise<Appointment[]> {
    const sql =
      "SELECT insured_id, schedule_id, country_iso, status FROM appointments WHERE insured_id = ?";
    try {
      const [rows] = await this.pool.execute(sql, [insuredId]);
      return (rows as any[]).map(
        (row) =>
          new Appointment(
            row.insuredId,
            row.scheduleId,
            row.countryISO,
            row.status
          )
      );
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
