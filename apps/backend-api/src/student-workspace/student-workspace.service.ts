import { Injectable, Inject } from "@nestjs/common";
import { Pool } from "pg";

@Injectable()
export class StudentWorkspaceService {
  constructor(@Inject("DATABASE_POOL") private readonly pool: Pool) {}

  async getWorkspaceData(
    studentId: number,
    tenantId: string = "default-campus",
  ) {
    const userRes = await this.pool.query(
      `SELECT id, name, email, grade_level FROM users WHERE id = $1 AND tenant_id = $2`,
      [studentId, tenantId],
    );

    const attendanceRes = await this.pool.query(
      `SELECT a.*, c.title as course_title 
       FROM attendance a 
       JOIN courses c ON a.course_id = c.id 
       WHERE a.student_id = $1`,
      [studentId],
    );

    return {
      profile: userRes.rows[0] || null,
      attendance: attendanceRes.rows,
      workshops: [
        {
          title: "AI in Robotics Workshop",
          date: "2026-08-10",
          instructor: "Dr. Sridevi",
        },
      ],
    };
  }
}
