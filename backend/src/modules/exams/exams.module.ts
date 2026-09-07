import { Module } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';
import { SupabaseService } from '../../common/database/supabase.service';

@Module({
  controllers: [ExamsController],
  providers: [ExamsService, SupabaseService],
  exports: [ExamsService],
})
export class ExamsModule {}
