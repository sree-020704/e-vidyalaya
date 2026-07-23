import { Controller, Get, Query } from "@nestjs/common";
import { CoursesService } from "./courses.service";

@Controller("courses")
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get("catalog")
  async getCatalog(@Query("tenantId") tenantId: string = "default-campus") {
    return this.coursesService.getCatalog(tenantId);
  }
}
