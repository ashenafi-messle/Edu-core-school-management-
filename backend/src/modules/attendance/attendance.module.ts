import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { SupabaseService } from '../../common/database/supabase.service';

@Module({
  controllers: [AttendanceController],
  providers: [AttendanceService, SupabaseService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
