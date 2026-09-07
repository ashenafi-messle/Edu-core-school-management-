/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  PublishAnnouncementDto,
  ListAnnouncementsQuery
} from './announcements.dto';

@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  // ==========================================
  // BASIC ANNOUNCEMENT CRUD ENDPOINTS
  // ==========================================

  /**
   * Create new announcement
   * POST /announcements
   */
  @Post()
  create(@Body() body: CreateAnnouncementDto) {
    return this.announcementsService.create(body);
  }

  /**
   * List all announcements with filtering
   * GET /announcements
   */
  @Get()
  findAll(@Query() query?: ListAnnouncementsQuery) {
    return this.announcementsService.findAll(query);
  }

  // ==========================================
  // SPECIAL ENDPOINTS (must come before :id routes)
  // ==========================================

  /**
   * Get announcement statistics
   * GET /announcements/statistics
   */
  @Get('statistics')
  getStatistics() {
    return this.announcementsService.getStatistics();
  }

  /**
   * Get published announcements for specific audience
   * GET /announcements/published/:audience
   */
  @Get('published/:audience')
  getPublishedAnnouncements(
    @Param('audience') audience: string,
    @Query('gradeId') gradeId?: string
  ) {
    return this.announcementsService.getPublishedAnnouncements(audience, gradeId);
  }

  // ==========================================
  // INDIVIDUAL ANNOUNCEMENT ENDPOINTS
  // ==========================================

  /**
   * Get specific announcement details
   * GET /announcements/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.announcementsService.findOne(id);
  }

  /**
   * Update announcement record
   * PUT /announcements/:id
   */
  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateAnnouncementDto) {
    return this.announcementsService.update(id, body);
  }

  /**
   * Delete announcement record
   * DELETE /announcements/:id
   */
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.announcementsService.delete(id);
  }

  // ==========================================
  // PUBLISHING ENDPOINTS
  // ==========================================

  /**
   * Publish announcement
   * POST /announcements/:id/publish
   */
  @Post(':id/publish')
  publish(@Param('id') id: string, @Body() body: PublishAnnouncementDto) {
    return this.announcementsService.publish(id, body);
  }

  /**
   * Archive announcement
   * POST /announcements/:id/archive
   */
  @Post(':id/archive')
  archive(@Param('id') id: string) {
    return this.announcementsService.archive(id);
  }
}
