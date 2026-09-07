import { Module } from '@nestjs/common';
import { GradebookService } from './gradebook.service';
import { GradebookController } from './gradebook.controller';
import { SupabaseService } from '../../common/database/supabase.service';

@Module({
  controllers: [GradebookController],
  providers: [GradebookService, SupabaseService],
  exports: [GradebookService],
})
export class GradebookModule {}
