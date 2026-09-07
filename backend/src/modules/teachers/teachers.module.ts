import { Module } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { SupabaseService } from '../../common/database/supabase.service';

@Module({
  controllers: [TeachersController],
  providers: [TeachersService, SupabaseService],
  exports: [TeachersService],
})
export class TeachersModule {}
