import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Inject,
} from "@nestjs/common";
import { Pool } from "pg";

@Controller("schedules")
export class SchedulesController {
  constructor(@Inject("DATABASE_POOL") private readonly pool: Pool) {}

  // 1. Get Schedules Filtered by Grade (e.g. ?grade=Grade 10)
  @Get()
  async getSchedulesByGrade(@Query("grade") grade: string) {
    const targetGrade = grade || "Grade 10";
    const query = `
      SELECT 
        s.id, c.code, c.title, s.day_of_week, s.start_time, s.end_time, 
        s.meeting_link AS "zoomUrl", s.meeting_link, c.grade_level, u.name AS faculty
      FROM schedules s
      JOIN courses c ON s.course_id = c.id
      LEFT JOIN users u ON s.faculty_id = u.id
      WHERE c.grade_level = $1
      ORDER BY s.start_time ASC;
    `;
    const res = await this.pool.query(query, [targetGrade]);
    return res.rows;
  }

  // 2. Create Broadcast Schedule from Faculty
  @Post()
  async createSchedule(
    @Body() body: any,
    @Query("tenantId") tenantId: string = "default-campus",
  ) {
    let courseRes = await this.pool.query(
      "SELECT id FROM courses WHERE code = $1",
      [body.courseCode],
    );
    let courseId = courseRes.rows[0]?.id;

    if (!courseId) {
      const newCourse = await this.pool.query(
        `INSERT INTO courses (tenant_id, code, title, grade_level) 
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [
          tenantId,
          body.courseCode,
          body.title || "Live Course",
          body.gradeLevel || "Grade 10",
        ],
      );
      courseId = newCourse.rows[0].id;
    }

    const res = await this.pool.query(
      `INSERT INTO schedules (tenant_id, course_id, day_of_week, start_time, end_time, meeting_link, zoom_meeting_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`,
      [
        tenantId,
        courseId,
        body.dayOfWeek || "Monday",
        body.startTime || "08:30:00",
        body.endTime || "09:30:00",
        body.zoomUrl || body.meeting_link,
        "1000000010",
      ],
    );
    return { success: true, schedule: res.rows[0] };
  }

  // 3. Get Student Grade Timetable by Student ID
  @Get("student/:studentId")
  async getStudentSchedule(
    @Param("studentId") studentId: string,
    @Query("tenantId") tenantId: string = "default-campus",
  ) {
    const userRes = await this.pool.query(
      `SELECT grade_level FROM users WHERE id = $1`,
      [studentId],
    );
    const userGrade = userRes.rows[0]?.grade_level || "Grade 10";

    const query = `
      SELECT s.id, c.code, c.title, s.day_of_week, s.start_time, s.end_time, s.meeting_link
      FROM schedules s
      JOIN courses c ON s.course_id = c.id
      WHERE c.grade_level = $1 AND s.tenant_id = $2;
    `;
    const res = await this.pool.query(query, [userGrade, tenantId]);
    return res.rows;
  }
}
