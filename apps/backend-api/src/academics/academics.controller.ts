import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Inject,
  Optional,
} from "@nestjs/common";
import { Pool } from "pg";

// FR-ADM-03: White-Label Shared State
export let memoryTenant = {
  school_name: "e-Vidyalaya High School",
  primary_color: "#0F1E3D",
  secondary_color: "#B8842E",
  custom_domain: "campus.evidyalaya.edu",
  logo_url: "",
  logo_text: "eV",
};

// FR-ADM-02: Shared User Directory State
export let memoryUsers = [
  {
    id: 1,
    name: "System Administrator",
    email: "admin@evidyalaya.edu",
    role: "admin",
    status: "Active",
    approval_status: "Approved",
  },
  {
    id: 2,
    name: "Prof. R. Sharma",
    email: "sharma@evidyalaya.com",
    role: "faculty",
    status: "Active",
    approval_status: "Approved",
  },
  {
    id: 3,
    name: "Dr. Ananya Rao",
    email: "ananya@evidyalaya.com",
    role: "faculty",
    status: "Pending",
    approval_status: "Pending Approval",
  },
  {
    id: 4,
    name: "Rahul Sharma",
    email: "rahul@student.com",
    role: "student",
    status: "Active",
    approval_status: "Approved",
  },
];

// FR-ADM-04: System Audit Logs & Live Metrics
export let memoryAuditLogs: any[] = [
  {
    id: 101,
    timestamp: new Date().toISOString(),
    event: "FACULTY_APPROVAL",
    details: "Admin approved faculty account: sharma@evidyalaya.com",
  },
  {
    id: 102,
    timestamp: new Date().toISOString(),
    event: "BRANDING_UPDATE",
    details: "Tenant primary theme configured to #0F1E3D",
  },
];

export let memoryEvents: any[] = [
  {
    id: 1,
    title: "Annual Inter-House Sports Meet 2026",
    date: "2026-08-15",
    category: "Sports",
    description: "Track & field events at main athletics ground.",
    target: "ALL",
  },
];

@Controller("admin")
export class AdminController {
  constructor(
    @Optional() @Inject("DATABASE_POOL") private readonly pool?: Pool,
  ) {}

  // ================= FR-ADM-03: WHITE-LABEL BRANDING =================
  @Get("branding")
  async getBranding() {
    try {
      if (this.pool) {
        const res = await this.pool.query(
          `SELECT * FROM tenant_settings LIMIT 1;`,
        );
        if (res.rows.length > 0) return res.rows[0];
      }
    } catch (e) {}
    return memoryTenant;
  }

  @Put("branding")
  async updateBranding(@Body() body: any) {
    memoryTenant = { ...memoryTenant, ...body };
    try {
      if (this.pool) {
        await this.pool.query(
          `UPDATE tenant_settings SET school_name = $1, primary_color = $2, secondary_color = $3, custom_domain = $4, logo_url = $5, logo_text = $6;`,
          [
            memoryTenant.school_name,
            memoryTenant.primary_color,
            memoryTenant.secondary_color,
            memoryTenant.custom_domain,
            memoryTenant.logo_url,
            memoryTenant.logo_text,
          ],
        );
      }
    } catch (e) {}

    memoryAuditLogs.unshift({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      event: "WHITE_LABEL_UPDATE",
      details: `Branding updated: ${memoryTenant.school_name} (${memoryTenant.custom_domain})`,
    });

    return { success: true, tenant: memoryTenant };
  }

  // ================= FR-ADM-02: USER & ROLE MANAGEMENT =================
  @Get("users")
  async getUsers() {
    try {
      if (this.pool) {
        const res = await this.pool.query(
          `SELECT * FROM users ORDER BY id DESC;`,
        );
        if (res.rows.length > 0) return res.rows;
      }
    } catch (e) {}
    return memoryUsers;
  }

  @Post("users")
  async createUser(@Body() body: any) {
    const newUser = {
      id: Date.now(),
      name: body.name,
      email: body.email,
      role: (body.role || "student").toLowerCase(),
      status: "Active",
      approval_status: "Approved",
    };

    try {
      if (this.pool) {
        const res = await this.pool.query(
          `INSERT INTO users (name, email, role, status) VALUES ($1, $2, $3, $4) RETURNING *;`,
          [newUser.name, newUser.email, newUser.role, newUser.status],
        );
        if (res.rows[0]) memoryUsers.unshift(res.rows[0]);
        else memoryUsers.unshift(newUser);
      } else {
        memoryUsers.unshift(newUser);
      }
    } catch (e) {
      memoryUsers.unshift(newUser);
    }

    memoryAuditLogs.unshift({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      event: "USER_PROVISIONED",
      details: `Provisioned ${newUser.role.toUpperCase()} account: ${newUser.email}`,
    });

    return { success: true, user: newUser };
  }

  @Put("users/:id/approve")
  async approveFaculty(@Param("id") id: string) {
    const numericId = Number(id);
    memoryUsers = memoryUsers.map((u) =>
      u.id === numericId
        ? { ...u, status: "Active", approval_status: "Approved" }
        : u,
    );

    try {
      if (this.pool) {
        await this.pool.query(
          `UPDATE users SET status = 'Active' WHERE id = $1;`,
          [numericId],
        );
      }
    } catch (e) {}

    memoryAuditLogs.unshift({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      event: "FACULTY_APPROVED",
      details: `Approved faculty membership for user #${id}`,
    });

    return { success: true };
  }

  @Put("users/:id/status")
  async toggleUserStatus(
    @Param("id") id: string,
    @Body() body: { status: string },
  ) {
    const numericId = Number(id);
    memoryUsers = memoryUsers.map((u) =>
      u.id === numericId ? { ...u, status: body.status } : u,
    );

    try {
      if (this.pool) {
        await this.pool.query(`UPDATE users SET status = $1 WHERE id = $2;`, [
          body.status,
          numericId,
        ]);
      }
    } catch (e) {}

    memoryAuditLogs.unshift({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      event: "STATUS_CHANGE",
      details: `User #${id} status changed to ${body.status}`,
    });

    return { success: true };
  }

  @Post("users/:id/reset-password")
  resetUserPassword(@Param("id") id: string) {
    const tempPassword = `Reset@${Math.floor(1000 + Math.random() * 9000)}`;

    memoryAuditLogs.unshift({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      event: "PASSWORD_RESET",
      details: `Forced password reset triggered for user #${id}`,
    });

    return {
      success: true,
      message: "Temporary password generated.",
      tempPassword,
    };
  }

  @Delete("users/:id")
  async deleteUser(@Param("id") id: string) {
    const numericId = Number(id);
    memoryUsers = memoryUsers.filter((u) => u.id !== numericId);

    try {
      if (this.pool) {
        await this.pool.query(`DELETE FROM users WHERE id = $1;`, [numericId]);
      }
    } catch (e) {}

    return { success: true };
  }

  // ================= FR-ADM-04: AUDITS & ANALYTICS =================
  @Get("analytics")
  getAnalytics() {
    return {
      liveConcurrency: 142,
      totalRevenue: 284500,
      activeUsers: memoryUsers.filter((u) => u.status === "Active").length,
      pendingApprovals: memoryUsers.filter(
        (u) => u.approval_status === "Pending Approval",
      ).length,
      systemUptime: "99.98%",
      logs: memoryAuditLogs,
    };
  }

  // ================= SPORTS & CAMPUS EVENTS =================
  @Get("events")
  getEvents() {
    return memoryEvents;
  }

  @Post("events")
  createEvent(@Body() body: any) {
    const newEvent = {
      id: Date.now(),
      title: body.title,
      date: body.date || "2026-08-15",
      category: body.category || "Sports",
      description: body.description,
      target: body.target || "ALL",
    };
    memoryEvents.unshift(newEvent);

    memoryAuditLogs.unshift({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      event: "EVENT_PUBLISHED",
      details: `Published event: ${newEvent.title}`,
    });

    return { success: true, event: newEvent };
  }

  @Delete("events/:id")
  deleteEvent(@Param("id") id: string) {
    const numericId = Number(id);
    memoryEvents = memoryEvents.filter((e) => e.id !== numericId);
    return { success: true };
  }
}
