/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../common/database/supabase.service';
import {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  PublishAnnouncementDto,
  AnnouncementProfileDto,
  ListAnnouncementsQuery,
  AnnouncementStatistics,
} from './announcements.dto';

@Injectable()
export class AnnouncementsService {
  constructor(private readonly supabase: SupabaseService) {}

  /**
   * Create a new announcement
   */
  async create(dto: CreateAnnouncementDto): Promise<AnnouncementProfileDto> {
    const schoolId = this.supabase.getSchoolId();
    
    const { data, error } = await this.supabase.client
      .from('announcements')
      .insert({
        school_id: schoolId,
        title: dto.title,
        content: dto.content,
        type: dto.type || 'general',
        priority: dto.priority || 'normal',
        status: dto.status || 'draft',
        target_audience: dto.target_audience || 'all',
        target_grade_id: dto.target_grade_id,
        expires_at: dto.expires_at,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to create announcement: ${error.message}`);
    }

    return data;
  }

  /**
   * Get all announcements with filtering
   */
  async findAll(query?: ListAnnouncementsQuery): Promise<AnnouncementProfileDto[]> {
    const schoolId = this.supabase.getSchoolId();
    
    let dbQuery = this.supabase.client
      .from('announcements')
      .select('*')
      .eq('school_id', schoolId);

    // Apply filters
    if (query?.type) {
      dbQuery = dbQuery.eq('type', query.type);
    }
    if (query?.status) {
      dbQuery = dbQuery.eq('status', query.status);
    }
    if (query?.priority) {
      dbQuery = dbQuery.eq('priority', query.priority);
    }
    if (query?.target_audience) {
      dbQuery = dbQuery.eq('target_audience', query.target_audience);
    }
    if (query?.target_grade_id) {
      dbQuery = dbQuery.eq('target_grade_id', query.target_grade_id);
    }
    if (query?.published_by) {
      dbQuery = dbQuery.eq('published_by', query.published_by);
    }
    if (query?.search) {
      dbQuery = dbQuery.or(`title.ilike.%${query.search}%,content.ilike.%${query.search}%`);
    }

    // Ordering
    dbQuery = dbQuery.order('created_at', { ascending: false });

    // Pagination
    if (query?.limit) {
      dbQuery = dbQuery.limit(query.limit);
    }
    if (query?.offset) {
      dbQuery = dbQuery.range(query.offset, query.offset + (query.limit || 10) - 1);
    }

    const { data, error } = await dbQuery;

    if (error) {
      throw new BadRequestException(`Failed to fetch announcements: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get a specific announcement by ID
   */
  async findOne(id: string): Promise<AnnouncementProfileDto> {
    const schoolId = this.supabase.getSchoolId();
    
    const { data, error } = await this.supabase.client
      .from('announcements')
      .select('*')
      .eq('id', id)
      .eq('school_id', schoolId)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }

    return data;
  }

  /**
   * Update an announcement
   */
  async update(id: string, dto: UpdateAnnouncementDto): Promise<AnnouncementProfileDto> {
    const schoolId = this.supabase.getSchoolId();
    
    // Check if announcement exists
    await this.findOne(id);

    const { data, error } = await this.supabase.client
      .from('announcements')
      .update({
        ...dto,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to update announcement: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete an announcement
   */
  async delete(id: string): Promise<void> {
    const schoolId = this.supabase.getSchoolId();
    
    // Check if announcement exists
    await this.findOne(id);

    const { error } = await this.supabase.client
      .from('announcements')
      .delete()
      .eq('id', id)
      .eq('school_id', schoolId);

    if (error) {
      throw new BadRequestException(`Failed to delete announcement: ${error.message}`);
    }
  }

  /**
   * Publish an announcement
   */
  async publish(id: string, dto: PublishAnnouncementDto): Promise<AnnouncementProfileDto> {
    const schoolId = this.supabase.getSchoolId();
    
    // Check if announcement exists
    await this.findOne(id);

    const { data, error } = await this.supabase.client
      .from('announcements')
      .update({
        status: 'published',
        published_by: dto.published_by,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to publish announcement: ${error.message}`);
    }

    return data;
  }

  /**
   * Archive an announcement
   */
  async archive(id: string): Promise<AnnouncementProfileDto> {
    const schoolId = this.supabase.getSchoolId();
    
    // Check if announcement exists
    await this.findOne(id);

    const { data, error } = await this.supabase.client
      .from('announcements')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to archive announcement: ${error.message}`);
    }

    return data;
  }

  /**
   * Get announcement statistics
   */
  async getStatistics(): Promise<AnnouncementStatistics> {
    const schoolId = this.supabase.getSchoolId();
    
    const { data: announcements, error } = await this.supabase.client
      .from('announcements')
      .select('*')
      .eq('school_id', schoolId);

    if (error) {
      throw new BadRequestException(`Failed to fetch statistics: ${error.message}`);
    }

    const stats: AnnouncementStatistics = {
      total: announcements.length,
      draft: 0,
      published: 0,
      archived: 0,
      by_type: {
        general: 0,
        urgent: 0,
        event: 0,
        academic: 0,
        administrative: 0,
      },
      by_priority: {
        low: 0,
        normal: 0,
        high: 0,
        urgent: 0,
      },
      by_audience: {
        all: 0,
        teachers: 0,
        parents: 0,
        students: 0,
        specific_grade: 0,
      },
    };

    announcements.forEach((announcement) => {
      // Count by status
      if (announcement.status === 'draft') stats.draft++;
      else if (announcement.status === 'published') stats.published++;
      else if (announcement.status === 'archived') stats.archived++;

      // Count by type
      if (stats.by_type.hasOwnProperty(announcement.type)) {
        stats.by_type[announcement.type as keyof typeof stats.by_type]++;
      }

      // Count by priority
      if (stats.by_priority.hasOwnProperty(announcement.priority)) {
        stats.by_priority[announcement.priority as keyof typeof stats.by_priority]++;
      }

      // Count by audience
      if (stats.by_audience.hasOwnProperty(announcement.target_audience)) {
        stats.by_audience[announcement.target_audience as keyof typeof stats.by_audience]++;
      }
    });

    return stats;
  }

  /**
   * Get published announcements for a specific audience
   */
  async getPublishedAnnouncements(audience: string, gradeId?: string): Promise<AnnouncementProfileDto[]> {
    const schoolId = this.supabase.getSchoolId();
    
    let dbQuery = this.supabase.client
      .from('announcements')
      .select('*')
      .eq('school_id', schoolId)
      .eq('status', 'published')
      .or(`target_audience.eq.all,target_audience.eq.${audience}`);

    // Filter out expired announcements
    dbQuery = dbQuery.or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

    // If specific grade, also include announcements targeted to that grade
    if (gradeId) {
      dbQuery = dbQuery.or(`target_grade_id.is.null,target_grade_id.eq.${gradeId}`);
    }

    dbQuery = dbQuery.order('published_at', { ascending: false });

    const { data, error } = await dbQuery;

    if (error) {
      throw new BadRequestException(`Failed to fetch published announcements: ${error.message}`);
    }

    return data || [];
  }
}
