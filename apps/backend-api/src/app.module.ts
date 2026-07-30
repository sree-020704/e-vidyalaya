import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "./auth/auth.module";
// import { AdminModule } from "./admin/admin.module"; // Commented out until created
import { FacultyModule } from "./faculty/faculty.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    // AdminModule,
    FacultyModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
