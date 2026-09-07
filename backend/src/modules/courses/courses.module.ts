import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { SupabaseService } from '../../common/database/supabase.service';

@Module({
  controllers: [CoursesController],
  providers: [CoursesService, SupabaseService],
  exports: [CoursesService],
})
export class CoursesModule {}