import { Module } from "@nestjs/common";
import { FacultyController } from "./faculty.controller";

@Module({
  controllers: [FacultyController],
})
export class FacultyModule {}
