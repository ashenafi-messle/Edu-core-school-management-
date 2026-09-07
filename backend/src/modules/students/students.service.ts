import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../common/database/supabase.service';
import { TenantContext } from '../../common/context/tenant.context';

@Injectable()
export class StudentsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Create a new student record
   */
  async create(studentData: { user_id?: string; parent_id?: string; admission_number: string; full_name: string; grade_level: string; section?: string }) {
    const schoolId = TenantContext.getSchoolId();
    if (!schoolId) {
      throw new InternalServerErrorException('Tenant context not resolved.');
    }

    const client = this.supabaseService.getClient();

    // Verify uniqueness of admission number per school
    const { data: existing } = await client
      .from('students')
      .select('id')
      .eq('school_id', schoolId)
      .eq('admission_number', studentData.admission_number)
      .maybeSingle();

    if (existing) {
      throw new BadRequestException(`Admission Number '${studentData.admission_number}' already exists in your school roster.`);
    }

    return this.supabaseService.insertTenantRecord('students', studentData);
  }

  /**
   * Find all students inside the school
   */
  async findAll() {
    const { data, error } = await this.supabaseService.fromTenantTable('students');
    if (error) {
      throw new BadRequestException(`Failed to retrieve school roster: ${error.message}`);
    }
    return data;
  }

  /**
   * Find a single student in the school
   */
  async findOne(id: string) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('students')
      .select('*')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(`Failed to query student: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Student with ID '${id}' is not registered under your school.`);
    }

    return data;
  }

  /**
   * Update student details
   */
  async update(id: string, updateData: any) {
    delete updateData.school_id;
    return this.supabaseService.updateTenantRecord('students', id, updateData);
  }

  /**
   * Remove a student from the school
   */
  async delete(id: string) {
    return this.supabaseService.deleteTenantRecord('students', id);
  }
}
