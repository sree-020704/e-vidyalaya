import { Controller, Get, Param, Query } from "@nestjs/common";
import { StudentWorkspaceService } from "./student-workspace.service";

@Controller("student-workspace")
export class StudentWorkspaceController {
  constructor(private readonly workspaceService: StudentWorkspaceService) {}

  @Get(":studentId")
  async getWorkspace(
    @Param("studentId") studentId: string,
    @Query("tenantId") tenantId: string = "default-campus",
  ) {
    return this.workspaceService.getWorkspaceData(Number(studentId), tenantId);
  }
}
