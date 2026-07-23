import { Module } from "@nestjs/common";
import { StudentWorkspaceController } from "./student-workspace.controller";
import { StudentWorkspaceService } from "./student-workspace.service";

@Module({
  controllers: [StudentWorkspaceController],
  providers: [StudentWorkspaceService],
})
export class StudentWorkspaceModule {}
