import { Module } from '@nestjs/common';
import { ParentFeedbackService } from './parent-feedback.service';
import { ParentFeedbackController } from './parent-feedback.controller';
import { SupabaseService } from '../../common/database/supabase.service';

@Module({
  controllers: [ParentFeedbackController],
  providers: [ParentFeedbackService, SupabaseService],
  exports: [ParentFeedbackService],
})
export class ParentFeedbackModule {}
