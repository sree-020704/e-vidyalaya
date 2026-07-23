import { Controller, Get, Post, Body, Param, Query } from "@nestjs/common";
import { SchedulesService } from "./schedules.service";

@Controller("schedules")
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  async createSchedule(
    @Body() body: any,
    @Query("tenantId") tenantId: string = "default-campus",
  ) {
    return this.schedulesService.createSchedule(body, tenantId);
  }

  @Get("student/:studentId")
  async getStudentSchedule(
    @Param("studentId") studentId: string,
    @Query("tenantId") tenantId: string = "default-campus",
  ) {
    return this.schedulesService.getStudentGradeTimetable(
      Number(studentId),
      tenantId,
    );
  }
}
