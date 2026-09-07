import { Module } from '@nestjs/common';
import { SubjectAssignmentsService } from './subject-assignments.service';
import { SubjectAssignmentsController } from './subject-assignments.controller';
import { SupabaseModule } from '../../common/database/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [SubjectAssignmentsController],
  providers: [SubjectAssignmentsService],
  exports: [SubjectAssignmentsService],
})
export class SubjectAssignmentsModule {}