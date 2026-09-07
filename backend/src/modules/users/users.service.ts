import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../common/database/supabase.service';
import { TenantContext } from '../../common/context/tenant.context';

@Injectable()
export class UsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Authenticate user across all schools
   */
  async login(email: string, passwordHash: string) {
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .eq('password_hash', passwordHash)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(`Login failed: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException('Invalid email or password. Verify the credentials and try again.');
    }

    if (data.status !== 'active') {
      throw new BadRequestException('This account is inactive. Please contact your administrator.');
    }

    return data;
  }

  /**
   * Create a new user associated with the active school tenant
   */
  async create(userData: { email: string; password_hash: string; full_name: string; role: string; phone?: string }) {
    const schoolId = TenantContext.getSchoolId();
    if (!schoolId) {
      throw new InternalServerErrorException('Active school context is missing.');
    }

    const client = this.supabaseService.getClient();

    // Enforce email uniqueness per school
    const { data: existing, error: checkError } = await client
      .from('users')
      .select('id')
      .eq('school_id', schoolId)
      .eq('email', userData.email)
      .maybeSingle();

    if (existing) {
      throw new BadRequestException(`User with email '${userData.email}' already exists inside this school.`);
    }

    return this.supabaseService.insertTenantRecord('users', userData);
  }

  /**
   * List all users belonging to the active school
   */
  async findAll() {
    const { data, error } = await this.supabaseService.fromTenantTable('users');
    if (error) {
      throw new BadRequestException(`Failed to retrieve school users: ${error.message}`);
    }
    return data;
  }

  /**
   * Get single user scoped by the active school
   */
  async findOne(id: string) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(`Failed to load user: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`User with ID '${id}' does not exist in your school.`);
    }

    return data;
  }

  /**
   * Update a user in the active school
   */
  async update(id: string, updateData: any) {
    // Clean school_id from payload if present, to block any tenant hijacking attempts
    delete updateData.school_id;
    return this.supabaseService.updateTenantRecord('users', id, updateData);
  }

  /**
   * Delete a user in the active school
   */
  async delete(id: string) {
    return this.supabaseService.deleteTenantRecord('users', id);
  }
}
