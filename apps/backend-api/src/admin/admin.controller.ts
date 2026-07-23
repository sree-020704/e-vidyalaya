import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Inject,
} from "@nestjs/common";
import { Pool } from "pg";

@Controller("admin")
export class AdminController {
  constructor(@Inject("DATABASE_POOL") private readonly pool: Pool) {}

  // 1. Get Platform Health Analytics & Active Counts
  @Get("analytics")
  async getPlatformAnalytics() {
    const studentsRes = await this.pool.query(
      `SELECT COUNT(*) FROM users WHERE role = 'student'`,
    );
    const facultyRes = await this.pool.query(
      `SELECT COUNT(*) FROM users WHERE role = 'faculty' AND is_approved = TRUE`,
    );
    const liveClassesRes = await this.pool.query(
      `SELECT COUNT(*) FROM live_classes WHERE status = 'Live'`,
    );

    return {
      activeStudents: parseInt(studentsRes.rows[0].count),
      activeFaculty: parseInt(facultyRes.rows[0].count),
      liveRoomsConcurrency: parseInt(liveClassesRes.rows[0].count),
      streamLatency: "1.4s",
      totalRevenue: "₹1,42,500",
    };
  }

  // 2. Fetch Pending Faculty Accounts
  @Get("faculty/pending")
  async getPendingFaculty() {
    const res = await this.pool.query(
      `SELECT id, name, email, phone, created_at FROM users WHERE role = 'faculty' AND is_approved = FALSE`,
    );
    return res.rows;
  }

  // 3. Approve or Reject Faculty Account
  @Put("faculty/approve/:id")
  async approveFaculty(
    @Param("id") id: string,
    @Body("isApproved") isApproved: boolean,
  ) {
    await this.pool.query(`UPDATE users SET is_approved = $1 WHERE id = $2`, [
      isApproved,
      id,
    ]);
    return {
      success: true,
      message: isApproved
        ? "Faculty approved successfully!"
        : "Faculty account rejected.",
    };
  }

  // 4. Save White-Label Multi-Tenant Branding Config
  @Put("tenant/branding")
  async updateTenantBranding(
    @Body()
    body: {
      tenantId: string;
      schoolName: string;
      domain: string;
      primaryColor: string;
      secondaryColor: string;
    },
  ) {
    const query = `
      UPDATE tenants
      SET name = $1, domain = $2, primary_color = $3, secondary_color = $4
      WHERE id = $5
      RETURNING *;
    `;
    const res = await this.pool.query(query, [
      body.schoolName,
      body.domain,
      body.primaryColor,
      body.secondaryColor,
      body.tenantId || "default-campus",
    ]);

    return {
      success: true,
      message: "Tenant white-labeling updated successfully!",
      tenant: res.rows[0],
    };
  }
}
