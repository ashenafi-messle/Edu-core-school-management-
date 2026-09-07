import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { SupabaseService } from './common/database/supabase.service';
import { SchoolsModule } from './modules/schools/schools.module';
import { UsersModule } from './modules/users/users.module';
import { StudentsModule } from './modules/students/students.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { ParentsModule } from './modules/parents/parents.module';
import { RegistrationsModule } from './modules/registrations/registrations.module';
import { ParentFeedbackModule } from './modules/parent-feedback/parent-feedback.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { ExamsModule } from './modules/exams/exams.module';
import { CoursesModule } from './modules/courses/courses.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { SubjectAssignmentsModule } from './modules/subject-assignments/subject-assignments.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { GradebookModule } from './modules/gradebook/gradebook.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';

@Module({
  imports: [
    SchoolsModule,
    UsersModule,
    StudentsModule,
    TeachersModule,
    ParentsModule,
    RegistrationsModule,
    ParentFeedbackModule,
    PaymentsModule,
    AttendanceModule,
    ExamsModule,
    CoursesModule,
    SubjectsModule,
    SubjectAssignmentsModule,
    AnnouncementsModule,
    GradebookModule,
  ],
  providers: [SupabaseService],
})
export class AppModule implements NestModule {
  /**
   * Bind the global tenant intercepting middleware to enforce X-School-ID headers
   */
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude(
        { path: 'schools', method: RequestMethod.POST } // Exclude public school creation
      )
      .forRoutes('*'); // Enforce on all other endpoints
  }
}
