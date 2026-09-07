import { Module } from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { RegistrationsController } from './registrations.controller';
import { SupabaseService } from '../../common/database/supabase.service';

@Module({
  controllers: [RegistrationsController],
  providers: [RegistrationsService, SupabaseService],
  exports: [RegistrationsService],
})
export class RegistrationsModule {}
