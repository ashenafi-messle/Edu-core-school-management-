import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../common/database/supabase.service';
import { TenantContext } from '../../common/context/tenant.context';
import {
  CreateRegistrationDto,
  UpdateRegistrationDto,
  RegistrationProfileDto,
  ParentStudentMappingDto,
  ListRegistrationsQuery,
  RegistrationWithRelatedDataDto
} from './registrations.dto';

@Injectable()
export class RegistrationsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Create a new registration record
   */
  async create(registrationData: CreateRegistrationDto) {
    const schoolId = TenantContext.getSchoolId();
    if (!schoolId) {
      throw new InternalServerErrorException('Tenant context not resolved.');
    }

    const client = this.supabaseService.getClient();

    // Check if reference_id already exists in this school
    const { data: existing } = await client
      .from('registrations')
      .select('id')
      .eq('school_id', schoolId)
      .eq('reference_id', registrationData.reference_id)
      .maybeSingle();

    if (existing) {
      throw new BadRequestException(`Registration with reference ID '${registrationData.reference_id}' already exists.`);
    }

    return this.supabaseService.insertTenantRecord('registrations', registrationData);
  }

  /**
   * List all registrations with optional filtering
   */
  async findAll(query?: ListRegistrationsQuery) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    let registrationsQuery = client
      .from('registrations')
      .select('*')
      .eq('school_id', schoolId);

    // Apply search filter (searches student name, parent name, reference_id)
    if (query?.search) {
      registrationsQuery = registrationsQuery.or(
        `student_first_name.ilike.%${query.search}%,student_last_name.ilike.%${query.search}%,parent_first_name.ilike.%${query.search}%,parent_last_name.ilike.%${query.search}%,reference_id.ilike.%${query.search}%`
      );
    }

    // Apply status filter
    if (query?.status) {
      registrationsQuery = registrationsQuery.eq('status', query.status);
    }

    // Apply grade level filter
    if (query?.grade_level) {
      registrationsQuery = registrationsQuery.eq('student_grade_level', query.grade_level);
    }

    // Apply relationship filter
    if (query?.relationship) {
      registrationsQuery = registrationsQuery.eq('parent_relationship', query.relationship);
    }

    // Apply pagination
    if (query?.limit) {
      registrationsQuery = registrationsQuery.limit(parseInt(query.limit));
    }
    if (query?.offset) {
      const limitNum = parseInt(query.limit || '10');
      registrationsQuery = registrationsQuery.range(parseInt(query.offset), parseInt(query.offset) + limitNum - 1);
    }

    const { data, error } = await registrationsQuery.order('submitted_at', { ascending: false });

    if (error) {
      throw new BadRequestException(`Failed to retrieve registrations: ${error.message}`);
    }

    return data;
  }

  /**
   * Get single registration details
   */
  async findOne(id: string): Promise<RegistrationProfileDto> {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('registrations')
      .select('*')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(`Failed to retrieve registration: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Registration with ID '${id}' not found.`);
    }

    return data;
  }

  /**
   * Get registration with related student and parent data
   */
  async findOneWithRelatedData(id: string): Promise<RegistrationWithRelatedDataDto> {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { data: registration, error: registrationError } = await client
      .from('registrations')
      .select('*')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (registrationError || !registration) {
      throw new NotFoundException(`Registration with ID '${id}' not found.`);
    }

    // Try to find matching student by phone or email
    let student = null;
    const { data: studentData } = await client
      .from('students')
      .select('id, admission_number')
      .eq('school_id', schoolId)
      .or(`phone.eq.${registration.student_phone},email.eq.${registration.student_email}`)
      .maybeSingle();

    if (studentData) {
      student = studentData;
    }

    // Try to find matching parent by phone or email
    let parent = null;
    const { data: parentData } = await client
      .from('parents')
      .select('id, user_id')
      .eq('school_id', schoolId)
      .or(`phone.eq.${registration.parent_phone},email.eq.${registration.parent_email}`)
      .maybeSingle();

    if (parentData) {
      parent = parentData;
    }

    return {
      ...registration,
      student,
      parent
    };
  }

  /**
   * Update registration record
   */
  async update(id: string, updateData: UpdateRegistrationDto) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    // Verify registration exists
    const { data: existing } = await client
      .from('registrations')
      .select('id')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (!existing) {
      throw new NotFoundException(`Registration with ID '${id}' not found.`);
    }

    // Handle status transitions with timestamps
    const updatePayload = { ...updateData };
    if (updateData.status) {
      const now = new Date().toISOString();
      
      switch (updateData.status) {
        case 'under_review':
          updatePayload.review_started_at = now;
          break;
        case 'approved':
          updatePayload.approved_at = now;
          break;
        case 'rejected':
          updatePayload.rejected_at = now;
          break;
        case 'enrolled':
          updatePayload.enrolled_at = now;
          break;
      }
    }

    delete updatePayload.school_id;

    const { data, error } = await client
      .from('registrations')
      .update(updatePayload)
      .eq('id', id)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to update registration: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete registration record
   */
  async delete(id: string) {
    return this.supabaseService.deleteTenantRecord('registrations', id);
  }

  /**
   * Get parent-student mappings from registrations
   */
  async getParentStudentMappings(query?: ListRegistrationsQuery): Promise<ParentStudentMappingDto[]> {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    let mappingsQuery = client
      .from('registrations')
      .select('*')
      .eq('school_id', schoolId)
      .in('status', ['approved', 'enrolled']);

    // Apply filters
    if (query?.search) {
      mappingsQuery = mappingsQuery.or(
        `student_first_name.ilike.%${query.search}%,student_last_name.ilike.%${query.search}%,parent_first_name.ilike.%${query.search}%,parent_last_name.ilike.%${query.search}%`
      );
    }

    if (query?.grade_level) {
      mappingsQuery = mappingsQuery.eq('student_grade_level', query.grade_level);
    }

    if (query?.relationship) {
      mappingsQuery = mappingsQuery.eq('parent_relationship', query.relationship);
    }

    const { data, error } = await mappingsQuery.order('submitted_at', { ascending: false });

    if (error) {
      throw new BadRequestException(`Failed to retrieve parent-student mappings: ${error.message}`);
    }

    // Transform to mapping format
    return data.map((reg: any) => ({
      registration_id: reg.id,
      parent_id: undefined, // Will be populated when linked
      student_id: undefined, // Will be populated when linked
      parent_first_name: reg.parent_first_name,
      parent_last_name: reg.parent_last_name,
      parent_relationship: reg.parent_relationship,
      parent_phone: reg.parent_phone,
      parent_email: reg.parent_email,
      student_first_name: reg.student_first_name,
      student_last_name: reg.student_last_name,
      student_grade_level: reg.student_grade_level,
      student_phone: reg.student_phone,
      student_email: reg.student_email,
      status: reg.status,
      emergency_contact: reg.emergency_contact_name !== null && reg.emergency_contact_name !== undefined,
      created_at: reg.submitted_at
    }));
  }

  /**
   * Link registration to existing parent and student records
   */
  async linkToExistingRecords(registrationId: string, parentId?: string, studentId?: string) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    // Verify registration exists
    const { data: registration } = await client
      .from('registrations')
      .select('*')
      .eq('id', registrationId)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (!registration) {
      throw new NotFoundException(`Registration with ID '${registrationId}' not found.`);
    }

    // If student ID provided, update student with parent_id
    if (studentId && parentId) {
      const { error: studentError } = await client
        .from('students')
        .update({ parent_id: parentId })
        .eq('id', studentId)
        .eq('school_id', schoolId);

      if (studentError) {
        throw new BadRequestException(`Failed to link student to parent: ${studentError.message}`);
      }
    }

    // Update registration status to enrolled if both linked
    if (studentId && parentId) {
      await this.update(registrationId, { 
        status: 'enrolled',
        enrolled_at: new Date().toISOString()
      });
    }

    return { success: true, message: 'Records linked successfully' };
  }

  /**
   * Get registration statistics
   */
  async getStatistics() {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('registrations')
      .select('status')
      .eq('school_id', schoolId);

    if (error) {
      throw new BadRequestException(`Failed to retrieve statistics: ${error.message}`);
    }

    const stats = {
      total: data.length,
      pending: data.filter((r: any) => r.status === 'pending').length,
      under_review: data.filter((r: any) => r.status === 'under_review').length,
      approved: data.filter((r: any) => r.status === 'approved').length,
      rejected: data.filter((r: any) => r.status === 'rejected').length,
      enrolled: data.filter((r: any) => r.status === 'enrolled').length
    };

    return stats;
  }

  /**
   * Update registration status
   */
  async updateStatus(id: string, status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'enrolled', reason?: string) {
    return this.update(id, { 
      status,
      rejection_reason: reason,
      admin_notes: reason
    });
  }
}
