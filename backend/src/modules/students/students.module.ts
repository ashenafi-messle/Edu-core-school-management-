import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { SupabaseService } from '../../common/database/supabase.service';

@Module({
  controllers: [StudentsController],
  providers: [StudentsService, SupabaseService],
  exports: [StudentsService],
})
export class StudentsModule {}
