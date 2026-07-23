import { Injectable } from "@nestjs/common";
import { Pool } from "pg";

@Injectable()
export class SchedulesService {
  private pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "evidyalaya",
    password: "root",
    port: 5432,
  });
  async createSchedule(data: any, tenantId: string = "default-campus") {
    const { courseId, facultyId, dayOfWeek, startTime, endTime } = data;
    const query = `
      INSERT INTO schedules (tenant_id, course_id, faculty_id, day_of_week, start_time, end_time)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
    `;
    const res = await this.pool.query(query, [
      tenantId,
      courseId,
      facultyId,
      dayOfWeek,
      startTime,
      endTime,
    ]);
    return res.rows[0];
  }

  async getStudentGradeTimetable(studentId: number, tenantId: string) {
    const userRes = await this.pool.query(
      `SELECT grade_level FROM users WHERE id = $1 AND tenant_id = $2`,
      [studentId, tenantId],
    );
    const grade = userRes.rows[0]?.grade_level || "Grade 5";

    const query = `
      SELECT s.id, s.day_of_week, s.start_time, s.end_time, s.meeting_link, s.zoom_meeting_id, s.zoom_passcode,
             c.code as course_code, c.title as course_title, u.name as faculty_name
      FROM schedules s
      JOIN courses c ON s.course_id = c.id
      JOIN enrollments e ON e.course_id = c.id
      LEFT JOIN users u ON s.faculty_id = u.id
      WHERE e.student_id = $1 AND c.grade_level = $2 AND s.tenant_id = $3;
    `;
    const res = await this.pool.query(query, [studentId, grade, tenantId]);
    return { studentGradeLevel: grade, schedules: res.rows };
  }

  async getStudentTimetable(studentId: number, tenantId: string) {
    return this.getStudentGradeTimetable(studentId, tenantId);
  }
}
