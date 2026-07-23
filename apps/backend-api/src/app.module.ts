import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AdminController } from './admin/admin.controller';
import { FacultyController } from './faculty/faculty.controller';
import { AuthModule } from './auth/auth.module'; // 👈 Import AuthModule
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule, // 👈 Register AuthModule here
  ],
  controllers: [
    AppController,
    AdminController,
    FacultyController,
  ],
  providers: [],
})
export class AppModule {}