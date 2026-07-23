import { Injectable, Inject } from "@nestjs/common";
import { Pool } from "pg";

@Injectable()
export class CoursesService {
  constructor(@Inject("DATABASE_POOL") private readonly pool: Pool) {}

  async getCatalog(tenantId: string = "default-campus") {
    const res = await this.pool.query(
      `SELECT c.*, u.name as faculty_name 
       FROM courses c 
       LEFT JOIN users u ON c.faculty_id = u.id 
       WHERE c.tenant_id = $1`,
      [tenantId],
    );
    return res.rows;
  }
}
