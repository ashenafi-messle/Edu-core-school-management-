import { Module } from '@nestjs/common';
import { ParentsService } from './parents.service';
import { ParentsController } from './parents.controller';
import { SupabaseService } from '../../common/database/supabase.service';

@Module({
  controllers: [ParentsController],
  providers: [ParentsService, SupabaseService],
  exports: [ParentsService],
})
export class ParentsModule {}
