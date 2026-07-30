import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  Inject,
  Optional,
} from "@nestjs/common";
import { Pool } from "pg";

import { memoryTenant, memoryEvents } from "../admin/admin.controller";
import { memoryTimetable } from "../faculty/faculty.controller";

let memoryProfile = {
  name: "Rahul Sharma",
  email: "rahul@student.com",
  phone: "+91 98765 43210",
  admissionNo: "EV-2026-1042",
  dob: "2010-05-15",
  gender: "Male",
  gradeLevel: "Grade 10",
  parentName: "Ramesh Sharma",
  parentPhone: "+91 98765 00000",
  address: "Central Campus Quarters",
  avatarUrl: "",
};

let memoryTickets: any[] = [];
let memoryCheckoutTransactions: any[] = [];

@Controller("api/student-portal")
export class StudentApiController {
  constructor(
    @Optional() @Inject("DATABASE_POOL") private readonly pool?: Pool,
  ) {}

  @Get("profile")
  async getProfile() {
    try {
      if (this.pool) {
        const res = await this.pool.query(`SELECT * FROM students LIMIT 1;`);
        if (res.rows.length > 0) return res.rows[0];
      }
    } catch (e) {}
    return memoryProfile;
  }

  @Put("profile")
  async updateProfile(@Body() body: any) {
    memoryProfile = { ...memoryProfile, ...body };
    try {
      if (this.pool) {
        await this.pool.query(
          `UPDATE students SET name = $1, email = $2, phone = $3, address = $4, avatar_url = $5 WHERE admission_no = $6;`,
          [
            memoryProfile.name,
            memoryProfile.email,
            memoryProfile.phone,
            memoryProfile.address,
            memoryProfile.avatarUrl,
            memoryProfile.admissionNo,
          ],
        );
      }
    } catch (e) {}
    return { success: true, profile: memoryProfile };
  }

  @Get("overview")
  async getOverview(@Query("grade") grade: string) {
    const targetGrade = grade ? grade.trim() : "Grade 10";
    try {
      if (this.pool) {
        const assignRes = await this.pool.query(
          `SELECT COUNT(*) FROM assignments WHERE TRIM(grade_level) ILIKE TRIM($1);`,
          [targetGrade],
        );
        return {
          attendancePct: 94,
          academicScorePct: 88,
          pendingAssignments: parseInt(assignRes.rows[0]?.count || "2", 10),
          overallGrade: "A+",
        };
      }
    } catch (e) {}

    return {
      attendancePct: 94,
      academicScorePct: 88,
      pendingAssignments: 2,
      overallGrade: "A+",
    };
  }

  @Get("timetable")
  async getTimetable(@Query("grade") grade: string) {
    const targetGrade = grade ? grade.trim() : "Grade 10";
    try {
      if (this.pool) {
        const res = await this.pool.query(
          `SELECT c.code, c.title, s.day_of_week, 
                  TO_CHAR(s.start_time, 'HH12:MI AM') AS start_time, 
                  TO_CHAR(s.end_time, 'HH12:MI AM') AS end_time 
           FROM schedules s 
           JOIN courses c ON s.course_id = c.id 
           WHERE TRIM(c.grade_level) ILIKE TRIM($1);`,
          [targetGrade],
        );
        if (res.rows.length > 0) return res.rows;
      }
    } catch (e) {}

    return memoryTimetable.filter(
      (t) =>
        (t.grade_level || "Grade 10").toLowerCase() ===
        targetGrade.toLowerCase(),
    );
  }

  @Get("notifications")
  async getNotifications(@Query("grade") grade: string) {
    const targetGrade = grade ? grade.trim() : "Grade 10";
    try {
      if (this.pool) {
        const res = await this.pool.query(
          `SELECT * FROM notifications WHERE TRIM(grade_level) ILIKE TRIM($1) OR grade_level ILIKE 'ALL' ORDER BY id DESC;`,
          [targetGrade],
        );
        if (res.rows.length > 0) return res.rows;
      }
    } catch (e) {}

    const eventNotices = memoryEvents.map((e) => ({
      id: e.id,
      title: `🏆 [${e.category}] ${e.title}`,
      message: `${e.description} (Date: ${e.date})`,
      sender_name: "Super Admin",
    }));

    return eventNotices.length
      ? eventNotices
      : [
          {
            id: 1,
            title: "Welcome to e-Vidyalaya Portal",
            message:
              "All live classes and dynamic test links are updated daily.",
            sender_name: "Super Admin",
          },
        ];
  }

  @Get("support/tickets")
  async getTickets(@Query("email") email: string) {
    try {
      if (this.pool) {
        const res = await this.pool.query(
          `SELECT * FROM support_tickets WHERE user_email = $1 ORDER BY id DESC;`,
          [email || "rahul@student.com"],
        );
        if (res.rows.length > 0) return res.rows;
      }
    } catch (e) {}
    return memoryTickets;
  }

  @Post("support/tickets")
  async createTicket(
    @Body() body: { subject: string; message: string; userEmail: string },
  ) {
    const newTicket = {
      id: Date.now(),
      subject: body.subject,
      message: body.message,
      user_email: body.userEmail || "rahul@student.com",
      status: "Open",
    };
    memoryTickets.unshift(newTicket);

    try {
      if (this.pool) {
        await this.pool.query(
          `INSERT INTO support_tickets (user_email, subject, message, status) VALUES ($1, $2, $3, 'Open');`,
          [newTicket.user_email, newTicket.subject, newTicket.message],
        );
      }
    } catch (e) {}

    return { success: true, ticket: newTicket };
  }

  @Post("checkout")
  async processCheckout(
    @Body() body: { courseId: number; paymentMethod: string },
  ) {
    const transaction = {
      transactionId: `TXN-${Date.now()}`,
      courseId: body.courseId,
      paymentMethod: body.paymentMethod || "UPI_GATEWAY",
      status: "SUCCESS",
      timestamp: new Date().toISOString(),
    };
    memoryCheckoutTransactions.unshift(transaction);
    return { success: true, ...transaction };
  }

  @Post("chat")
  async aiChatBot(@Body() body: { message: string; grade: string }) {
    const msg = (body.message || "").toLowerCase();
    let reply = `I'm your ${memoryTenant.school_name} AI assistant. How can I help with your ${body.grade || "Grade 10"} classes?`;

    if (msg.includes("test") || msg.includes("assignment")) {
      reply = `You can view all dynamic tests published by your faculty under the "Assignments & Test Links 📝" tab!`;
    } else if (
      msg.includes("class") ||
      msg.includes("schedule") ||
      msg.includes("zoom")
    ) {
      reply = `Check the "Upcoming Classes 🎥" tab to launch live Zoom broadcasts for ${body.grade || "Grade 10"}.`;
    } else if (
      msg.includes("notice") ||
      msg.includes("announcement") ||
      msg.includes("event")
    ) {
      reply = `Recent campus events and announcements are listed under "Class Announcements 🔔".`;
    }

    return { reply };
  }
}
