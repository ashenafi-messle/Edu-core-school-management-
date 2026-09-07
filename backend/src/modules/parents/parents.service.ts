import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../common/database/supabase.service';
import { TenantContext } from '../../common/context/tenant.context';
import {
  CreateParentDto,
  UpdateParentDto,
  ParentProfileDto,
  ListParentsQueryDto,
  ParentWithUserDto
} from './parents.dto';

@Injectable()
export class ParentsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Register a parent record
   */
  async create(parentData: CreateParentDto) {
    const schoolId = TenantContext.getSchoolId();
    if (!schoolId) {
      throw new InternalServerErrorException('Tenant context not resolved.');
    }

    const client = this.supabaseService.getClient();

    // If user_id is provided, verify the user exists and has parent role
    if (parentData.user_id) {
      const { data: user, error: userError } = await client
        .from('users')
        .select('id, role, school_id')
        .eq('id', parentData.user_id)
        .eq('school_id', schoolId)
        .maybeSingle();

      if (userError || !user) {
        throw new BadRequestException(`User with ID '${parentData.user_id}' not found in your school.`);
      }

      if (user.role !== 'parent') {
        throw new BadRequestException(`User must have 'parent' role to be associated with parent record.`);
      }
    }

    return this.supabaseService.insertTenantRecord('parents', parentData);
  }

  /**
   * List school parents with optional filtering
   */
  async findAll(query?: ListParentsQueryDto) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    let parentsQuery = client
      .from('parents')
      .select('*')
      .eq('school_id', schoolId);

    // Apply search filter
    if (query?.search) {
      parentsQuery = parentsQuery.ilike('full_name', `%${query.search}%`);
    }

    // Apply status filter
    if (query?.status) {
      parentsQuery = parentsQuery.eq('status', query.status);
    }

    // Apply relationship filter
    if (query?.relationship) {
      parentsQuery = parentsQuery.eq('relationship', query.relationship);
    }

    // Apply pagination
    if (query?.limit) {
      parentsQuery = parentsQuery.limit(query.limit);
    }
    if (query?.offset) {
      parentsQuery = parentsQuery.range(query.offset, query.offset + (query.limit || 10) - 1);
    }

    const { data, error } = await parentsQuery.order('created_at', { ascending: false });

    if (error) {
      throw new BadRequestException(`Failed to retrieve parents: ${error.message}`);
    }

    return data;
  }

  /**
   * Get single parent details with user information
   */
  async findOne(id: string): Promise<ParentWithUserDto> {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { data: parent, error: parentError } = await client
      .from('parents')
      .select('*')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (parentError) {
      throw new BadRequestException(`Failed to retrieve parent: ${parentError.message}`);
    }

    if (!parent) {
      throw new NotFoundException(`Parent with ID '${id}' is not registered under your school.`);
    }

    // Get associated user if user_id exists
    let user = null;
    if (parent.user_id) {
      const { data: userData } = await client
        .from('users')
        .select('id, email, phone, status, profile_picture_url')
        .eq('id', parent.user_id)
        .eq('school_id', schoolId)
        .maybeSingle();

      user = userData;
    }

    return {
      ...parent,
      user: user || undefined
    };
  }

  /**
   * Get complete parent profile with associated students count
   */
  async getProfile(id: string): Promise<ParentProfileDto> {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { data: parent, error: parentError } = await client
      .from('parents')
      .select('*')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (parentError || !parent) {
      throw new NotFoundException(`Parent with ID '${id}' not found.`);
    }

    // Get user information if linked
    let email, phone, profilePictureUrl, status;
    if (parent.user_id) {
      const { data: user } = await client
        .from('users')
        .select('email, phone, status, profile_picture_url')
        .eq('id', parent.user_id)
        .eq('school_id', schoolId)
        .maybeSingle();

      if (user) {
        email = user.email;
        phone = user.phone;
        profilePictureUrl = user.profile_picture_url;
        status = user.status;
      }
    }

    // Count associated students
    const { count: studentsCount } = await client
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('parent_id', id)
      .eq('school_id', schoolId);

    return {
      id: parent.id,
      user_id: parent.user_id,
      school_id: parent.school_id,
      full_name: parent.full_name,
      relationship: parent.relationship,
      emergency_contact: parent.emergency_contact,
      phone: phone,
      email: email,
      profile_picture_url: profilePictureUrl,
      status: status,
      created_at: parent.created_at,
      updated_at: parent.updated_at,
      associated_students_count: studentsCount || 0
    };
  }

  /**
   * Update parent record
   */
  async update(id: string, updateData: UpdateParentDto) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    // Verify parent exists
    const { data: existing } = await client
      .from('parents')
      .select('id')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (!existing) {
      throw new NotFoundException(`Parent with ID '${id}' not found.`);
    }

    // If updating user_id, verify the new user
    if (updateData.user_id !== undefined) {
      if (updateData.user_id) {
        const { data: user } = await client
          .from('users')
          .select('id, role, school_id')
          .eq('id', updateData.user_id)
          .eq('school_id', schoolId)
          .maybeSingle();

        if (!user || user.role !== 'parent') {
          throw new BadRequestException(`Invalid user_id. User must exist and have 'parent' role.`);
        }
      }
    }

    // Remove fields that shouldn't be updated directly
    const { user_id, ...parentUpdateData } = updateData;

    // Update parent record
    const { data, error } = await client
      .from('parents')
      .update(parentUpdateData)
      .eq('id', id)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to update parent: ${error.message}`);
    }

    // If user_id needs to be updated, do it separately
    if (user_id !== undefined) {
      await client
        .from('parents')
        .update({ user_id: user_id || null })
        .eq('id', id)
        .eq('school_id', schoolId);
    }

    return data;
  }

  /**
   * Delete parent from registry
   */
  async delete(id: string) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    // Check if parent has associated students
    const { data: students } = await client
      .from('students')
      .select('id')
      .eq('parent_id', id)
      .eq('school_id', schoolId)
      .limit(1);

    if (students && students.length > 0) {
      throw new BadRequestException(`Cannot delete parent with associated students. Please reassign or remove students first.`);
    }

    return this.supabaseService.deleteTenantRecord('parents', id);
  }

  /**
   * Activate parent
   */
  async activate(id: string) {
    return this.update(id, { status: 'active' });
  }

  /**
   * Deactivate parent
   */
  async deactivate(id: string) {
    return this.update(id, { status: 'inactive' });
  }

  /**
   * Get parent's associated students
   */
  async getStudents(parentId: string) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    // Verify parent exists
    const { data: parent } = await client
      .from('parents')
      .select('id')
      .eq('id', parentId)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (!parent) {
      throw new NotFoundException(`Parent with ID '${parentId}' not found.`);
    }

    const { data, error } = await client
      .from('students')
      .select('*')
      .eq('parent_id', parentId)
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new BadRequestException(`Failed to retrieve students: ${error.message}`);
    }

    return data;
  }
}
