import { Injectable, Inject } from "@nestjs/common";
import { Pool } from "pg";

@Injectable()
export class SupportService {
  constructor(@Inject("DATABASE_POOL") private readonly pool: Pool) {}

  async createTicket(
    studentId: number,
    message: string,
    tenantId: string = "default-campus",
  ) {
    const res = await this.pool.query(
      `INSERT INTO support_tickets (tenant_id, student_id, message) 
       VALUES ($1, $2, $3) RETURNING *`,
      [tenantId, studentId, message],
    );
    return res.rows[0];
  }
}
