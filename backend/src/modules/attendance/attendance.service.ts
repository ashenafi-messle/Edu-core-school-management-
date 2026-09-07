import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../common/database/supabase.service';
import { TenantContext } from '../../common/context/tenant.context';

@Injectable()
export class AttendanceService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Record a new attendance entry for a student
   */
  async create(attendanceData: { student_id: string; class_date: string; status: string; remarks?: string; taken_by?: string }) {
    const schoolId = TenantContext.getSchoolId();
    if (!schoolId) {
      throw new InternalServerErrorException('Tenant context not resolved.');
    }

    const client = this.supabaseService.getClient();

    // Prevent duplicate entries for the same student on the same calendar day
    const { data: existing } = await client
      .from('attendance')
      .select('id')
      .eq('student_id', attendanceData.student_id)
      .eq('class_date', attendanceData.class_date)
      .maybeSingle();

    if (existing) {
      throw new BadRequestException(`Attendance register already exists for this student on date ${attendanceData.class_date}.`);
    }

    return this.supabaseService.insertTenantRecord('attendance', attendanceData);
  }

  /**
   * List school attendance registers (Tenant bounded)
   */
  async findAll() {
    const { data, error } = await this.supabaseService.fromTenantTable('attendance');
    if (error) {
      throw new BadRequestException(`Failed to retrieve attendance log: ${error.message}`);
    }
    return data;
  }

  /**
   * Retrieve single attendance log details
   */
  async findOne(id: string) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('attendance')
      .select('*')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(`Failed to retrieve attendance: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Attendance record with ID '${id}' does not exist inside your school registrar.`);
    }

    return data;
  }

  /**
   * Update student attendance register
   */
  async update(id: string, updateData: any) {
    delete updateData.school_id;
    return this.supabaseService.updateTenantRecord('attendance', id, updateData);
  }

  /**
   * Delete attendance entry
   */
  async delete(id: string) {
    return this.supabaseService.deleteTenantRecord('attendance', id);
  }
}
