import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../common/database/supabase.service';
import { TenantContext } from '../../common/context/tenant.context';
import {
  CreateFeedbackDto,
  UpdateFeedbackDto,
  ResolveFeedbackDto,
  FeedbackProfileDto,
  ListFeedbackQuery,
  FeedbackStatistics
} from './parent-feedback.dto';

@Injectable()
export class ParentFeedbackService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Create a new feedback record
   */
  async create(feedbackData: CreateFeedbackDto) {
    const schoolId = TenantContext.getSchoolId();
    if (!schoolId) {
      throw new InternalServerErrorException('Tenant context not resolved.');
    }

    const client = this.supabaseService.getClient();

    // If parent_id provided, verify it exists in this school
    if (feedbackData.parent_id) {
      const { data: parent } = await client
        .from('parents')
        .select('id')
        .eq('id', feedbackData.parent_id)
        .eq('school_id', schoolId)
        .maybeSingle();

      if (!parent) {
        throw new BadRequestException(`Parent with ID '${feedbackData.parent_id}' not found in your school.`);
      }
    }

    // If student_id provided, verify it exists in this school
    if (feedbackData.student_id) {
      const { data: student } = await client
        .from('students')
        .select('id')
        .eq('id', feedbackData.student_id)
        .eq('school_id', schoolId)
        .maybeSingle();

      if (!student) {
        throw new BadRequestException(`Student with ID '${feedbackData.student_id}' not found in your school.`);
      }
    }

    return this.supabaseService.insertTenantRecord('parent_feedback', feedbackData);
  }

  /**
   * List all feedback with optional filtering
   */
  async findAll(query?: ListFeedbackQuery) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    let feedbackQuery = client
      .from('parent_feedback')
      .select('*')
      .eq('school_id', schoolId);

    // Apply search filter (searches parent name, student name, subject, message)
    if (query?.search) {
      feedbackQuery = feedbackQuery.or(
        `parent_name.ilike.%${query.search}%,student_name.ilike.%${query.search}%,subject.ilike.%${query.search}%,message.ilike.%${query.search}%`
      );
    }

    // Apply type filter
    if (query?.type) {
      feedbackQuery = feedbackQuery.eq('type', query.type);
    }

    // Apply status filter
    if (query?.status) {
      feedbackQuery = feedbackQuery.eq('status', query.status);
    }

    // Apply priority filter
    if (query?.priority) {
      feedbackQuery = feedbackQuery.eq('priority', query.priority);
    }

    // Apply parent filter
    if (query?.parent_id) {
      feedbackQuery = feedbackQuery.eq('parent_id', query.parent_id);
    }

    // Apply student filter
    if (query?.student_id) {
      feedbackQuery = feedbackQuery.eq('student_id', query.student_id);
    }

    // Apply pagination
    if (query?.limit) {
      feedbackQuery = feedbackQuery.limit(parseInt(query.limit));
    }
    if (query?.offset) {
      const limitNum = parseInt(query.limit || '10');
      feedbackQuery = feedbackQuery.range(parseInt(query.offset), parseInt(query.offset) + limitNum - 1);
    }

    const { data, error } = await feedbackQuery.order('created_at', { ascending: false });

    if (error) {
      throw new BadRequestException(`Failed to retrieve feedback: ${error.message}`);
    }

    return data;
  }

  /**
   * Get single feedback details
   */
  async findOne(id: string): Promise<FeedbackProfileDto> {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('parent_feedback')
      .select('*')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(`Failed to retrieve feedback: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Feedback with ID '${id}' not found.`);
    }

    return data;
  }

  /**
   * Update feedback record
   */
  async update(id: string, updateData: UpdateFeedbackDto) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    // Verify feedback exists
    const { data: existing } = await client
      .from('parent_feedback')
      .select('id')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (!existing) {
      throw new NotFoundException(`Feedback with ID '${id}' not found.`);
    }

    delete updateData.school_id;

    const { data, error } = await client
      .from('parent_feedback')
      .update(updateData)
      .eq('id', id)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to update feedback: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete feedback record
   */
  async delete(id: string) {
    return this.supabaseService.deleteTenantRecord('parent_feedback', id);
  }

  /**
   * Resolve feedback with response
   */
  async resolve(id: string, resolveData: ResolveFeedbackDto) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    // Verify feedback exists
    const { data: existing } = await client
      .from('parent_feedback')
      .select('id')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (!existing) {
      throw new NotFoundException(`Feedback with ID '${id}' not found.`);
    }

    const resolvePayload = {
      response: resolveData.response,
      resolved_by: resolveData.resolved_by,
      status: 'resolved',
      resolved_at: new Date().toISOString()
    };

    const { data, error } = await client
      .from('parent_feedback')
      .update(resolvePayload)
      .eq('id', id)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to resolve feedback: ${error.message}`);
    }

    return data;
  }

  /**
   * Get feedback statistics
   */
  async getStatistics(): Promise<FeedbackStatistics> {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('parent_feedback')
      .select('*')
      .eq('school_id', schoolId);

    if (error) {
      throw new BadRequestException(`Failed to retrieve statistics: ${error.message}`);
    }

    const stats: FeedbackStatistics = {
      total: data.length,
      pending: data.filter((f: any) => f.status === 'pending').length,
      in_progress: data.filter((f: any) => f.status === 'in_progress').length,
      resolved: data.filter((f: any) => f.status === 'resolved').length,
      closed: data.filter((f: any) => f.status === 'closed').length,
      by_type: {
        complaint: data.filter((f: any) => f.type === 'complaint').length,
        suggestion: data.filter((f: any) => f.type === 'suggestion').length,
        enquiry: data.filter((f: any) => f.type === 'enquiry').length,
        compliment: data.filter((f: any) => f.type === 'compliment').length
      },
      by_priority: {
        low: data.filter((f: any) => f.priority === 'low').length,
        normal: data.filter((f: any) => f.priority === 'normal').length,
        high: data.filter((f: any) => f.priority === 'high').length,
        urgent: data.filter((f: any) => f.priority === 'urgent').length
      }
    };

    return stats;
  }

  /**
   * Update feedback status
   */
  async updateStatus(id: string, status: 'pending' | 'in_progress' | 'resolved' | 'closed') {
    return this.update(id, { status });
  }

  /**
   * Get feedback by parent
   */
  async getByParent(parentId: string) {
    return this.findAll({ parent_id: parentId });
  }

  /**
   * Get feedback by student
   */
  async getByStudent(studentId: string) {
    return this.findAll({ student_id: studentId });
  }
}
