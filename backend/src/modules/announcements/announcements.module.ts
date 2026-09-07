/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { AnnouncementsController } from './announcements.controller';
import { SupabaseService } from '../../common/database/supabase.service';

@Module({
  controllers: [AnnouncementsController],
  providers: [AnnouncementsService, SupabaseService],
  exports: [AnnouncementsService],
})
export class AnnouncementsModule {}
