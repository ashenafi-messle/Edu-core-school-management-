import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../common/database/supabase.service';
import { TenantContext } from '../../common/context/tenant.context';
import {
  CreateSubjectDto,
  UpdateSubjectDto,
  SubjectDto
} from './subjects.dto';

@Injectable()
export class SubjectsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Create a new subject
   */
  async create(subjectData: CreateSubjectDto) {
    const schoolId = TenantContext.getSchoolId();
    if (!schoolId) {
      throw new InternalServerErrorException('Tenant context not resolved.');
    }

    const client = this.supabaseService.getClient();

    // Check for duplicate subject code within the same school
    const { data: existing } = await client
      .from('subjects')
      .select('id')
      .eq('school_id', schoolId)
      .eq('subject_code', subjectData.subject_code)
      .maybeSingle();

    if (existing) {
      throw new BadRequestException(`Subject with code '${subjectData.subject_code}' already exists in this school.`);
    }

    // Set default values
    const subjectToCreate = {
      ...subjectData,
      school_id: schoolId,
      category: subjectData.category || 'Core',
      weekly_hours: subjectData.weekly_hours || 4,
      status: subjectData.status || 'Active'
    };

    const { data, error } = await client
      .from('subjects')
      .insert(subjectToCreate)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to create subject: ${error.message}`);
    }

    return data;
  }

  /**
   * Get all subjects for the school
   */
  async findAll(filters?: {
    category?: string;
    status?: string;
  }): Promise<SubjectDto[]> {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    let query = client
      .from('subjects')
      .select('*')
      .eq('school_id', schoolId);

    // Apply filters
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('subject_code', { ascending: true });

    if (error) {
      throw new BadRequestException(`Failed to retrieve subjects: ${error.message}`);
    }

    return data;
  }

  /**
   * Get a specific subject by ID
   */
  async findOne(id: string): Promise<SubjectDto> {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('subjects')
      .select('*')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(`Failed to retrieve subject: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Subject with ID '${id}' not found.`);
    }

    return data;
  }

  /**
   * Update a subject
   */
  async update(id: string, updateData: UpdateSubjectDto) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    // Verify subject exists
    const { data: existing } = await client
      .from('subjects')
      .select('id, subject_code')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (!existing) {
      throw new NotFoundException(`Subject with ID '${id}' not found.`);
    }

    // Check for duplicate subject code if updating subject_code
    if (updateData.subject_code && updateData.subject_code !== existing.subject_code) {
      const { data: duplicate } = await client
        .from('subjects')
        .select('id')
        .eq('school_id', schoolId)
        .eq('subject_code', updateData.subject_code)
        .neq('id', id)
        .maybeSingle();

      if (duplicate) {
        throw new BadRequestException(`Subject with code '${updateData.subject_code}' already exists in this school.`);
      }
    }

    return this.supabaseService.updateTenantRecord('subjects', id, updateData);
  }

  /**
   * Delete a subject
   */
  async delete(id: string) {
    return this.supabaseService.deleteTenantRecord('subjects', id);
  }

  /**
   * Archive a subject (soft delete)
   */
  async archive(id: string) {
    return this.update(id, { status: 'Inactive' });
  }

  /**
   * Activate a subject
   */
  async activate(id: string) {
    return this.update(id, { status: 'Active' });
  }
}