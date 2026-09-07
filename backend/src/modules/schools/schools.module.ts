import { Module } from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { SchoolsController } from './schools.controller';
import { SupabaseService } from '../../common/database/supabase.service';

@Module({
  controllers: [SchoolsController],
  providers: [SchoolsService, SupabaseService],
  exports: [SchoolsService],
})
export class SchoolsModule {}
