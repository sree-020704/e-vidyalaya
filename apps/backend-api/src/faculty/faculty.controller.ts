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
  Optional,
} from "@nestjs/common";
import { Pool } from "pg";

// FR-FAC-01: Shared Faculty Profile State
export let memoryFacultyProfile = {
  name: "Prof. R. Sharma",
  email: "sharma@evidyalaya.com",
  phone: "+91 98765 12345",
  employeeId: "FAC-2026-8821",
  department: "Department of Mathematics & Physics",
  designation: "Senior Professor",
  qualification: "Ph.D. in Theoretical Physics",
  address: "Faculty Block B, Quarter 4",
  bio: "Specializing in Advanced Calculus, Analytical Geometry, and Quantum Mechanics.",
  avatarUrl: "",
};

// Global Shared In-Memory Data Stores
export let memoryAssignments: any[] = [
  {
    id: 1,
    title: "Mid-Term Calculus Quiz",
    grade_level: "Grade 10",
    gradeLevel: "Grade 10",
    due_date: "2026-08-01",
    dueDate: "2026-08-01",
    test_link: "https://forms.gle/sample1",
    testLink: "https://forms.gle/sample1",
  },
];

export let memoryAnnouncements: any[] = [];

export let memorySchedules: any[] = [
  {
    id: 1,
    title: "Advanced Calculus Live Broadcast",
    grade_level: "Grade 10",
    gradeLevel: "Grade 10",
    day_of_week: "Monday",
    dayOfWeek: "Monday",
    start_time: "08:30 AM",
    startTime: "08:30 AM",
    end_time: "09:30 AM",
    endTime: "09:30 AM",
    zoom_url: "https://zoom.us/j/demo",
    zoomUrl: "https://zoom.us/j/demo",
  },
];

export let memoryTimetable: any[] = [
  {
    id: 1,
    code: "MATH-101",
    title: "Advanced Calculus",
    day_of_week: "Monday",
    start_time: "08:30 AM",
    end_time: "09:30 AM",
    grade_level: "Grade 10",
  },
  {
    id: 2,
    code: "PHYS-202",
    title: "Quantum Physics",
    day_of_week: "Wednesday",
    start_time: "10:00 AM",
    end_time: "11:00 AM",
    grade_level: "Grade 10",
  },
];

export let memoryCatalog: any[] = [
  {
    id: 1,
    code: "CHEM-301",
    title: "Organic Chemistry & Reactions",
    price: 1299,
    trailer_url: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
  {
    id: 2,
    code: "BIO-102",
    title: "Human Anatomy & Genetics",
    price: 1499,
    trailer_url: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
];

export let memoryMaterials: any[] = [
  {
    id: 1,
    title: "Calculus Formula Sheet 2026",
    doc_type: "PDF",
    grade_level: "Grade 10",
    file_url:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
];

// FR-FAC-03: Student Roster Analytics & Payment Status Data
export let memoryRoster: any[] = [
  {
    id: 101,
    name: "Rahul Sharma",
    email: "rahul@student.com",
    grade: "Grade 10",
    interestGroup: "Advanced Physics & Math",
    paymentStatus: "CONFIRMED",
    attendanceRate: "94%",
  },
  {
    id: 102,
    name: "Priya Patel",
    email: "priya@student.com",
    grade: "Grade 10",
    interestGroup: "Biotechnology",
    paymentStatus: "CONFIRMED",
    attendanceRate: "88%",
  },
  {
    id: 103,
    name: "Kiran Kumar",
    email: "kiran@student.com",
    grade: "Grade 10",
    interestGroup: "Computer Science",
    paymentStatus: "PENDING",
    attendanceRate: "76%",
  },
];

export let memoryFacultySupport: any[] = [
  {
    id: 1,
    subject: "Zoom Broadcaster Connection Delay",
    message: "Audio delay noticed during Grade 10 calculus session.",
    status: "Resolved",
  },
];

@Controller("faculty")
export class FacultyController {
  constructor(
    @Optional() @Inject("DATABASE_POOL") private readonly pool?: Pool,
  ) {}

  // ================= 1. FACULTY PROFILE =================
  @Get("profile")
  getFacultyProfile() {
    return memoryFacultyProfile;
  }

  @Put("profile")
  updateFacultyProfile(@Body() body: any) {
    memoryFacultyProfile = { ...memoryFacultyProfile, ...body };
    return { success: true, profile: memoryFacultyProfile };
  }

  @Get("verification-status")
  getVerificationStatus(@Query("email") email?: string) {
    return {
      email: email || "sharma@evidyalaya.com",
      verificationStatus: "VERIFIED",
      approvalStatus: "Approved by Super Admin",
      onboardingComplete: true,
    };
  }

  // ================= 2. MASTER TIMETABLE =================
  @Get("timetable")
  getTimetable(@Query("grade") grade?: string) {
    const targetGrade = grade ? decodeURIComponent(grade) : "";
    if (targetGrade) {
      return memoryTimetable.filter(
        (t) =>
          (t.grade_level || "").toLowerCase() === targetGrade.toLowerCase(),
      );
    }
    return memoryTimetable;
  }

  @Post("timetable")
  createTimetableSlot(@Body() body: any) {
    const newSlot = {
      id: Date.now(),
      code: body.code || "SUBJ-101",
      title: body.title,
      day_of_week: body.dayOfWeek || "Monday",
      start_time: body.startTime || "08:30 AM",
      end_time: body.endTime || "09:30 AM",
      grade_level: body.gradeLevel || "Grade 10",
    };
    memoryTimetable.unshift(newSlot);
    return { success: true, item: newSlot };
  }

  @Delete("timetable/:id")
  deleteTimetableSlot(@Param("id") id: string) {
    memoryTimetable = memoryTimetable.filter((t) => t.id !== Number(id));
    return { success: true };
  }

  // ================= 3. COURSE MATERIALS & SYLLABUS =================
  @Get("materials/all")
  getMaterials(@Query("grade") grade?: string) {
    const targetGrade = grade ? decodeURIComponent(grade) : "";
    if (targetGrade) {
      return memoryMaterials.filter(
        (m) =>
          (m.grade_level || "").toLowerCase() === targetGrade.toLowerCase(),
      );
    }
    return memoryMaterials;
  }

  @Post("materials")
  createMaterial(@Body() body: any) {
    const newMaterial = {
      id: Date.now(),
      title: body.title,
      doc_type: body.docType || "Syllabus",
      grade_level: body.gradeLevel || "Grade 10",
      file_url:
        body.fileUrl ||
        "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    };
    memoryMaterials.unshift(newMaterial);
    return { success: true, item: newMaterial };
  }

  // ================= 4. STUDENT ROSTER ANALYTICS =================
  @Get("roster")
  getRoster(@Query("grade") grade?: string) {
    const targetGrade = grade ? decodeURIComponent(grade) : "";
    if (targetGrade) {
      return memoryRoster.filter(
        (r) => (r.grade || "").toLowerCase() === targetGrade.toLowerCase(),
      );
    }
    return memoryRoster;
  }

  @Post("roster")
  addStudentToRoster(@Body() body: any) {
    const newStudent = {
      id: Date.now(),
      name: body.name,
      email: body.email,
      grade: body.grade || "Grade 10",
      interestGroup: body.interestGroup || "General Academics",
      paymentStatus: body.paymentStatus || "CONFIRMED",
      attendanceRate: body.attendanceRate || "100%",
    };
    memoryRoster.unshift(newStudent);
    return { success: true, item: newStudent };
  }

  // ================= 5. ASSIGNMENTS & TEST LINKS =================
  @Get("assignments")
  getAssignments(@Query("grade") grade?: string) {
    const targetGrade = grade ? decodeURIComponent(grade) : "";
    if (targetGrade) {
      return memoryAssignments.filter(
        (a) =>
          (a.grade_level || a.gradeLevel || "").toLowerCase() ===
          targetGrade.toLowerCase(),
      );
    }
    return memoryAssignments;
  }

  @Post("assignments")
  createAssignment(@Body() body: any) {
    const newItem = {
      id: Date.now(),
      title: body.title,
      grade_level: body.gradeLevel || "Grade 10",
      gradeLevel: body.gradeLevel || "Grade 10",
      due_date: body.dueDate || "Tomorrow · 11:59 PM",
      dueDate: body.dueDate || "Tomorrow · 11:59 PM",
      test_link: body.testLink || "https://forms.gle/sample",
      testLink: body.testLink || "https://forms.gle/sample",
    };
    memoryAssignments.unshift(newItem);
    return { success: true, item: newItem };
  }

  @Delete("assignments/:id")
  deleteAssignment(@Param("id") id: string) {
    memoryAssignments = memoryAssignments.filter((a) => a.id !== Number(id));
    return { success: true };
  }

  // ================= 6. ANNOUNCEMENTS =================
  @Get("announcements")
  getAnnouncements(@Query("grade") grade?: string) {
    const targetGrade = grade ? decodeURIComponent(grade) : "";
    if (targetGrade) {
      return memoryAnnouncements.filter(
        (n) =>
          (n.grade_level || n.gradeLevel || "ALL").toLowerCase() === "all" ||
          (n.grade_level || n.gradeLevel || "").toLowerCase() ===
            targetGrade.toLowerCase(),
      );
    }
    return memoryAnnouncements;
  }

  @Post("announcements")
  createAnnouncement(@Body() body: any) {
    const newItem = {
      id: Date.now(),
      title: body.title,
      message: body.message,
      grade_level: body.gradeLevel || "Grade 10",
      gradeLevel: body.gradeLevel || "Grade 10",
      sender_name: body.senderName || "Faculty Instructor",
    };
    memoryAnnouncements.unshift(newItem);
    return { success: true, item: newItem };
  }

  @Delete("announcements/:id")
  deleteAnnouncement(@Param("id") id: string) {
    memoryAnnouncements = memoryAnnouncements.filter(
      (n) => n.id !== Number(id),
    );
    return { success: true };
  }

  // ================= 7. LIVE BROADCAST SCHEDULES =================
  @Get("schedules")
  getSchedules(@Query("grade") grade?: string) {
    const targetGrade = grade ? decodeURIComponent(grade) : "";
    if (targetGrade) {
      return memorySchedules.filter(
        (s) =>
          (s.grade_level || s.gradeLevel || "").toLowerCase() ===
          targetGrade.toLowerCase(),
      );
    }
    return memorySchedules;
  }

  @Post("schedules")
  createSchedule(@Body() body: any) {
    const newItem = {
      id: Date.now(),
      title: body.title,
      grade_level: body.gradeLevel || "Grade 10",
      gradeLevel: body.gradeLevel || "Grade 10",
      day_of_week: body.dayOfWeek || "Monday",
      dayOfWeek: body.dayOfWeek || "Monday",
      start_time: body.startTime || "08:30 AM",
      startTime: body.startTime || "08:30 AM",
      end_time: body.endTime || "09:30 AM",
      endTime: body.endTime || "09:30 AM",
      zoom_url: body.zoomUrl || "https://zoom.us/j/demo",
      zoomUrl: body.zoomUrl || "https://zoom.us/j/demo",
    };
    memorySchedules.unshift(newItem);
    return { success: true, item: newItem };
  }

  @Delete("schedules/:id")
  deleteSchedule(@Param("id") id: string) {
    memorySchedules = memorySchedules.filter((s) => s.id !== Number(id));
    return { success: true };
  }

  // ================= 8. CATALOG =================
  @Get("catalog")
  getCatalog() {
    return memoryCatalog;
  }

  @Post("catalog")
  createCatalog(@Body() body: any) {
    const newItem = {
      id: Date.now(),
      code: body.code,
      title: body.title,
      price: body.price || 1299,
      trailer_url:
        body.trailerUrl || "https://www.w3schools.com/html/mov_bbb.mp4",
    };
    memoryCatalog.unshift(newItem);
    return { success: true, item: newItem };
  }

  @Delete("catalog/:id")
  deleteCatalog(@Param("id") id: string) {
    memoryCatalog = memoryCatalog.filter((c) => c.id !== Number(id));
    return { success: true };
  }

  // ================= 9. TECHNICAL SUPPORT =================
  @Get("support")
  getSupport() {
    return memoryFacultySupport;
  }

  @Post("support")
  createSupport(@Body() body: any) {
    const newItem = {
      id: Date.now(),
      subject: body.subject,
      message: body.message,
      status: "Open",
    };
    memoryFacultySupport.unshift(newItem);
    return { success: true, item: newItem };
  }
}
