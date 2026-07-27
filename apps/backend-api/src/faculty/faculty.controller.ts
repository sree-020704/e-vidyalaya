import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Inject,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { Pool } from "pg";
import * as fs from "fs";

if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

@Controller("faculty")
export class FacultyController {
  constructor(@Inject("DATABASE_POOL") private readonly pool: Pool) {}

  // ==========================================
  // FR-FAC-01: REGISTRATION & VERIFICATION STATUS
  // ==========================================
  @Get("profile/status")
  async getFacultyStatus(@Query("email") email: string) {
    const userEmail = email || "sharma@evidyalaya.com";
    const res = await this.pool.query(
      `SELECT id, name, email, mobile, status AS "verificationStatus", role FROM user_accounts WHERE email = $1;`,
      [userEmail],
    );
    return (
      res.rows[0] || {
        name: "Prof. R. Sharma",
        email: userEmail,
        mobile: "+91 98765 43210",
        verificationStatus: "Active",
        role: "faculty",
      }
    );
  }

  // ==========================================
  // FR-FAC-02: TRAILERS, SYLLABUS & PROMO MATERIALS UPLOAD
  // ==========================================
  @Post("materials/upload")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./uploads",
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadMaterial(
    @UploadedFile() file: any,
    @Body() body: { title: string; materialType: string; gradeLevel: string },
  ) {
    const fileUrl = file
      ? `http://localhost:5000/uploads/${file.filename}`
      : "http://localhost:5000/uploads/sample.pdf";
    const res = await this.pool.query(
      `INSERT INTO class_materials (title, material_type, file_url, grade_level)
       VALUES ($1, $2, $3, $4) RETURNING *;`,
      [
        body.title,
        body.materialType || "Syllabus",
        fileUrl,
        body.gradeLevel || "Grade 10",
      ],
    );
    return { success: true, material: res.rows[0] };
  }

  @Get("materials/all")
  async getMaterials(@Query("grade") grade?: string) {
    let query = `SELECT * FROM class_materials`;
    const params: any[] = [];
    if (grade) {
      query += ` WHERE TRIM(grade_level) ILIKE TRIM($1)`;
      params.push(grade);
    }
    query += ` ORDER BY id DESC;`;
    const res = await this.pool.query(query, params);
    return res.rows;
  }

  // ==========================================
  // FR-FAC-02 & FR-FAC-03: LIVE & RECURRING CLASSES SCHEDULER
  // ==========================================
  @Get("schedules/all")
  async getAllSchedules(@Query("grade") grade?: string) {
    let query = `
      SELECT s.id, c.code, c.title, s.day_of_week, 
             TO_CHAR(s.start_time, 'HH12:MI AM') AS start_time, 
             TO_CHAR(s.end_time, 'HH12:MI AM') AS end_time, 
             s.meeting_link AS "zoomUrl", s.meeting_link, c.grade_level
      FROM schedules s
      JOIN courses c ON s.course_id = c.id
    `;
    const params: any[] = [];
    if (grade) {
      query += ` WHERE TRIM(c.grade_level) ILIKE TRIM($1)`;
      params.push(grade);
    }
    query += ` ORDER BY s.id DESC;`;
    const res = await this.pool.query(query, params);
    return res.rows;
  }

  @Post("schedules/create")
  async createSchedule(@Body() body: any) {
    let courseRes = await this.pool.query(
      "SELECT id FROM courses WHERE code = $1",
      [body.courseCode],
    );
    let courseId = courseRes.rows[0]?.id;

    if (!courseId) {
      const newCourse = await this.pool.query(
        `INSERT INTO courses (code, title, grade_level) VALUES ($1, $2, $3) RETURNING id`,
        [
          body.courseCode || "LIVE-101",
          body.title,
          body.gradeLevel || "Grade 10",
        ],
      );
      courseId = newCourse.rows[0].id;
    }

    const res = await this.pool.query(
      `INSERT INTO schedules (course_id, day_of_week, start_time, end_time, meeting_link)
       VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
      [
        courseId,
        body.dayOfWeek || "Monday",
        body.startTime || "08:30:00",
        body.endTime || "09:30:00",
        body.zoomUrl,
      ],
    );
    return { success: true, schedule: res.rows[0] };
  }

  @Put("schedules/:id")
  async updateSchedule(@Param("id") id: string, @Body() body: any) {
    await this.pool.query(
      `UPDATE schedules SET meeting_link = $1, day_of_week = COALESCE($2, day_of_week) WHERE id = $3`,
      [body.zoomUrl, body.dayOfWeek, id],
    );
    return { success: true, message: "Schedule updated" };
  }

  @Delete("schedules/:id")
  async deleteSchedule(@Param("id") id: string) {
    await this.pool.query(`DELETE FROM schedules WHERE id = $1`, [id]);
    return { success: true, message: "Schedule deleted" };
  }

  // ==========================================
  // FR-FAC-03: STUDENT ROSTER ANALYTICS & GROUP MAPPING
  // ==========================================
  @Get("roster")
  async getRoster() {
    const res = await this.pool.query(
      `SELECT * FROM student_roster ORDER BY id DESC;`,
    );
    return res.rows;
  }

  @Put("roster/:id/map-group")
  async mapStudentGroup(
    @Param("id") id: string,
    @Body() body: { assignedGroup: string; paymentStatus: string },
  ) {
    await this.pool.query(
      `UPDATE student_roster SET assigned_group = $1, payment_status = $2 WHERE id = $3;`,
      [body.assignedGroup, body.paymentStatus, id],
    );
    return {
      success: true,
      message: "Student group and payment status updated successfully",
    };
  }

  // ==========================================
  // E-LIBRARY & ASSIGNMENTS
  // ==========================================
  @Post("content/upload")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./uploads",
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadContent(
    @UploadedFile() file: any,
    @Body() body: { title: string; docType: string; gradeLevel: string },
  ) {
    const fileUrl = file
      ? `http://localhost:5000/uploads/${file.filename}`
      : "http://localhost:5000/uploads/sample.pdf";
    const query = `
      INSERT INTO elibrary_docs (title, doc_type, file_url, grade_level)
      VALUES ($1, $2, $3, $4) RETURNING *;
    `;
    const res = await this.pool.query(query, [
      body.title,
      body.docType || "pdf",
      fileUrl,
      body.gradeLevel || "Grade 10",
    ]);
    return { success: true, data: res.rows[0] };
  }

  @Get("assignments")
  async getAssignments(@Query("grade") grade?: string) {
    let query = `SELECT * FROM assignments`;
    const params: any[] = [];
    if (grade) {
      query += ` WHERE TRIM(grade_level) ILIKE TRIM($1)`;
      params.push(grade);
    }
    query += ` ORDER BY id DESC;`;
    const res = await this.pool.query(query, params);
    return res.rows;
  }

  @Post("assignments")
  async createAssignment(@Body() body: any) {
    const res = await this.pool.query(
      `INSERT INTO assignments (title, grade_level, due_date, test_link, status, obtained_marks, max_marks)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`,
      [
        body.title,
        body.gradeLevel || "Grade 10",
        body.dueDate || "Tomorrow · 11:59 PM",
        body.testLink || "https://forms.gle/sampleTestLink",
        body.status || "Pending",
        body.obtainedMarks || 0,
        body.maxMarks || 50,
      ],
    );
    return { success: true, assignment: res.rows[0] };
  }
}
