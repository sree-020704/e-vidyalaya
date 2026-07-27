import { Module } from "@nestjs/common";
import { AdminController } from "./admin/admin.controller";
import { FacultyController } from "./faculty/faculty.controller";
import { StudentApiController } from "./academics/academics.controller";
import { AuthModule } from "./auth/auth.module";
import { DatabaseModule } from "./database/database.module";

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [AdminController, FacultyController, StudentApiController],
  providers: [],
})
export class AppModule {}
