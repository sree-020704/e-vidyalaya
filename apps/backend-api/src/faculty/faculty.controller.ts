import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Inject,
  UseGuards,
} from "@nestjs/common";
import { Pool } from "pg";

@Controller("faculty")
export class FacultyController {
  constructor(@Inject("DATABASE_POOL") private readonly pool: Pool) {}

  // 1. Schedule a New Live Zoom Class
  @Post("classes/schedule")
  async scheduleClass(
    @Body()
    body: {
      title: string;
      courseCode: string;
      facultyId: number;
      scheduledAt: string;
      zoomMeetUrl: string;
    },
  ) {
    const query = `
      INSERT INTO live_classes (title, course_code, faculty_id, scheduled_at, zoom_meet_url, status)
      VALUES ($1, $2, $3, $4, $5, 'Upcoming')
      RETURNING *;
    `;
    const values = [
      body.title,
      body.courseCode,
      body.facultyId,
      body.scheduledAt,
      body.zoomMeetUrl,
    ];
    const res = await this.pool.query(query, values);
    return {
      success: true,
      message: "Live class scheduled successfully!",
      data: res.rows[0],
    };
  }

  // 2. Fetch Active Teaching Schedule for Faculty
  @Get("classes/:facultyId")
  async getFacultyClasses(@Param("facultyId") facultyId: string) {
    const res = await this.pool.query(
      `SELECT * FROM live_classes WHERE faculty_id = $1 ORDER BY scheduled_at DESC`,
      [facultyId],
    );
    return res.rows;
  }

  // 3. Upload E-Library Materials / Trailers
  @Post("content/upload")
  async uploadContent(
    @Body()
    body: {
      title: string;
      docType: "pdf" | "ppt" | "trailer";
      fileUrl: string;
      uploadedBy: number;
    },
  ) {
    const query = `
      INSERT INTO elibrary_docs (title, doc_type, file_url, uploaded_by)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const res = await this.pool.query(query, [
      body.title,
      body.docType,
      body.fileUrl,
      body.uploadedBy,
    ]);
    return {
      success: true,
      message: "Content published to student portal!",
      data: res.rows[0],
    };
  }

  // 4. Get Student Roster Analytics & Groups
  @Get("roster")
  async getStudentRoster() {
    const query = `
      SELECT u.id, u.name, u.email, u.grade_level, r.payment_status, r.attendance_rate, r.assigned_group
      FROM users u
      LEFT JOIN student_roster_mapping r ON u.id = r.student_id
      WHERE u.role = 'student';
    `;
    const res = await this.pool.query(query);
    return res.rows;
  }

  // 5. Update Student Group Assignment
  @Put("roster/group/:studentId")
  async updateStudentGroup(
    @Param("studentId") studentId: string,
    @Body("assignedGroup") assignedGroup: string,
  ) {
    const query = `
      UPDATE student_roster_mapping 
      SET assigned_group = $1 
      WHERE student_id = $2;
    `;
    await this.pool.query(query, [assignedGroup, studentId]);
    return { success: true, message: "Student group assignment updated." };
  }
}
