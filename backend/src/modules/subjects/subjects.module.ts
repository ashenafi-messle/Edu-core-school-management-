import { Module } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { SubjectsController } from './subjects.controller';
import { SupabaseService } from '../../common/database/supabase.service';

@Module({
  controllers: [SubjectsController],
  providers: [SubjectsService, SupabaseService],
  exports: [SubjectsService],
})
export class SubjectsModule {}