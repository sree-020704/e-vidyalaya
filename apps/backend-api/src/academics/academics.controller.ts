import { Controller, Get, Put, Body, Query, Inject } from "@nestjs/common";
import { Pool } from "pg";

@Controller("api/student-portal")
export class StudentApiController {
  constructor(@Inject("DATABASE_POOL") private readonly pool: Pool) {}

  // 1. OVERVIEW PROGRESS METRICS
  @Get("overview")
  async getOverviewMetrics(@Query("grade") grade: string) {
    const targetGrade = grade ? grade.trim() : "Grade 10";

    const attRes = await this.pool.query(
      `SELECT * FROM attendance_logs LIMIT 1;`,
    );
    const att = attRes.rows[0] || {
      present_days: 88,
      late_days: 4,
      absent_days: 2,
    };
    const totalDays = att.present_days + att.late_days + att.absent_days;
    const attendancePct =
      totalDays > 0 ? Math.round((att.present_days / totalDays) * 100) : 90;

    const assignRes = await this.pool.query(
      `SELECT status, obtained_marks, max_marks FROM assignments WHERE TRIM(grade_level) ILIKE TRIM($1)`,
      [targetGrade],
    );
    const assignments = assignRes.rows;
    const graded = assignments.filter(
      (a) => a.status === "Graded" && a.max_marks > 0,
    );

    let avgMarksPct = 85;
    if (graded.length > 0) {
      const sumPct = graded.reduce(
        (acc, a) => acc + (a.obtained_marks / a.max_marks) * 100,
        0,
      );
      avgMarksPct = Math.round(sumPct / graded.length);
    }

    const pendingCount = assignments.filter(
      (a) => a.status === "Pending",
    ).length;

    return {
      attendancePct,
      academicScorePct: avgMarksPct,
      pendingAssignments: pendingCount,
      overallGrade: avgMarksPct >= 90 ? "A+" : avgMarksPct >= 80 ? "A" : "B",
    };
  }

  // 2. STUDENT PROFILE & EDIT PROFILE
  @Get("profile")
  async getProfile() {
    const res = await this.pool.query(
      `SELECT * FROM student_profiles LIMIT 1;`,
    );
    return (
      res.rows[0] || {
        name: "Rahul Sharma",
        email: "rahul@student.com",
        roll_no: "EV-2026-1089",
        grade_level: "Grade 10",
        phone: "+91 98765 43210",
        address: "Central Campus Quarters",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
      }
    );
  }

  @Put("profile")
  async updateProfile(@Body() body: any) {
    const query = `
      UPDATE student_profiles 
      SET name = $1, email = $2, phone = $3, address = $4, avatar_url = $5
      WHERE id = (SELECT id FROM student_profiles LIMIT 1)
      RETURNING *;
    `;
    const res = await this.pool.query(query, [
      body.name,
      body.email,
      body.phone,
      body.address,
      body.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
    ]);
    return { success: true, profile: res.rows[0] };
  }

  // 3. NOTIFICATIONS FEED
  @Get("notifications")
  async getNotifications(@Query("grade") grade: string) {
    const targetGrade = grade ? grade.trim() : "Grade 10";
    const res = await this.pool.query(
      `SELECT * FROM notifications WHERE TRIM(grade_level) ILIKE TRIM($1) OR grade_level IS NULL ORDER BY id DESC;`,
      [targetGrade],
    );
    return res.rows;
  }

  // 4. ACADEMICS & TIMETABLE SCHEDULES
  @Get("schedules")
  async getSchedules(@Query("grade") grade: string) {
    const targetGrade = grade ? grade.trim() : "Grade 10";
    const query = `
      SELECT 
        s.id, c.code, c.title, s.day_of_week, 
        TO_CHAR(s.start_time, 'HH12:MI AM') AS start_time, 
        TO_CHAR(s.end_time, 'HH12:MI AM') AS end_time, 
        s.meeting_link AS "zoomUrl", s.meeting_link, 
        c.grade_level, 'Prof. R. Sharma' AS faculty
      FROM schedules s
      JOIN courses c ON s.course_id = c.id
      WHERE TRIM(c.grade_level) ILIKE TRIM($1)
      ORDER BY s.id DESC;
    `;
    const res = await this.pool.query(query, [targetGrade]);
    return res.rows;
  }

  // 5. COURSES & CERTIFICATIONS
  @Get("courses")
  async getCourses(
    @Query("grade") grade: string,
    @Query("category") category: string,
  ) {
    const targetGrade = grade ? grade.trim() : "Grade 10";
    const cat = category ? category.trim() : "Regular";
    const res = await this.pool.query(
      `SELECT * FROM courses WHERE TRIM(grade_level) ILIKE TRIM($1) AND TRIM(category) ILIKE TRIM($2);`,
      [targetGrade, cat],
    );
    return res.rows;
  }

  // 6. E-LIBRARY DOCUMENTS
  @Get("elibrary")
  async getLibraryDocs(@Query("grade") grade: string) {
    const targetGrade = grade ? grade.trim() : "Grade 10";
    const res = await this.pool.query(
      `SELECT * FROM elibrary_docs WHERE TRIM(grade_level) ILIKE TRIM($1) OR grade_level IS NULL ORDER BY id DESC;`,
      [targetGrade],
    );
    return res.rows;
  }

  // 7. ASSIGNMENTS & TEST LINKS
  @Get("assignments")
  async getAssignments(@Query("grade") grade: string) {
    const targetGrade = grade ? grade.trim() : "Grade 10";
    const res = await this.pool.query(
      `SELECT * FROM assignments WHERE TRIM(grade_level) ILIKE TRIM($1) ORDER BY id DESC;`,
      [targetGrade],
    );
    return res.rows;
  }

  // 8. ATTENDANCE METRICS
  @Get("attendance")
  async getAttendance() {
    const res = await this.pool.query(`SELECT * FROM attendance_logs LIMIT 1;`);
    return res.rows[0] || { present_days: 88, late_days: 4, absent_days: 2 };
  }

  // 9. CAMPUS ACTIVITIES
  @Get("activities")
  async getActivities(@Query("category") category: string) {
    let query = `SELECT * FROM campus_activities`;
    const params: any[] = [];
    if (category) {
      query += ` WHERE TRIM(category) ILIKE TRIM($1)`;
      params.push(category);
    }
    query += ` ORDER BY id DESC;`;
    const res = await this.pool.query(query, params);
    return res.rows;
  }
}
