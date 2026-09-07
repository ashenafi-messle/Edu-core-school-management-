import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../common/database/supabase.service';
import { TenantContext } from '../../common/context/tenant.context';
import {
  CreateTeacherDto,
  UpdateTeacherDto,
  CreatePerformanceMetricsDto,
  UpdatePerformanceMetricsDto,
  CreateEvaluationDto,
  UpdateEvaluationDto,
  CreateClassAssignmentDto,
  UpdateClassAssignmentDto,
  TeacherProfileDto
} from './teachers.dto';

@Injectable()
export class TeachersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Register a new teacher record with enhanced fields
   */
  async create(teacherData: CreateTeacherDto) {
    const schoolId = TenantContext.getSchoolId();
    if (!schoolId) {
      throw new InternalServerErrorException('Tenant context not resolved.');
    }

    const client = this.supabaseService.getClient();

    // Enforce employee_id uniqueness within this school
    const { data: existing } = await client
      .from('teachers')
      .select('id')
      .eq('school_id', schoolId)
      .eq('employee_id', teacherData.employee_id)
      .maybeSingle();

    if (existing) {
      throw new BadRequestException(`Employee with ID '${teacherData.employee_id}' is already registered in this school.`);
    }

    // Set default values for new fields
    const teacherToCreate = {
      ...teacherData,
      photo: teacherData.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      phone: teacherData.phone || '+1 (555) 000-0000',
      email: teacherData.email || `${teacherData.full_name.toLowerCase().replace(/\s+/g, '')}@educore.edu`,
      employment_date: teacherData.employment_date || new Date().toISOString(),
      status: teacherData.status || 'Active',
      weekly_load: teacherData.weekly_load || '0 hrs/wk',
      assigned_grades: teacherData.assigned_grades || [],
      assigned_sections: teacherData.assigned_sections || []
    };

    return this.supabaseService.insertTenantRecord('teachers', teacherToCreate);
  }

  /**
   * List all teachers belonging to the active school
   */
  async findAll() {
    const { data, error } = await this.supabaseService.fromTenantTable('teachers');
    if (error) {
      throw new BadRequestException(`Failed to retrieve teachers: ${error.message}`);
    }
    return data;
  }

  /**
   * Find single teacher in the school
   */
  async findOne(id: string) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('teachers')
      .select('*')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(`Failed to retrieve teacher record: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Teacher with ID '${id}' does not exist inside your school.`);
    }

    return data;
  }

  /**
   * Get complete teacher profile with all related data
   */
  async getTeacherProfile(id: string): Promise<TeacherProfileDto> {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    // Get teacher basic info
    const { data: teacher, error: teacherError } = await client
      .from('teachers')
      .select('*')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (teacherError || !teacher) {
      throw new NotFoundException(`Teacher with ID '${id}' not found.`);
    }

    // Get performance metrics
    const { data: performanceMetrics } = await client
      .from('teacher_performance_metrics')
      .select('*')
      .eq('teacher_id', id)
      .eq('school_id', schoolId)
      .order('academic_year', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Get evaluations
    const { data: evaluations } = await client
      .from('teacher_evaluations')
      .select('*')
      .eq('teacher_id', id)
      .eq('school_id', schoolId)
      .order('evaluation_date', { ascending: false });

    // Get class assignments
    const { data: classAssignments } = await client
      .from('teacher_class_assignments')
      .select('*')
      .eq('teacher_id', id)
      .eq('school_id', schoolId)
      .eq('is_active', true)
      .order('assigned_date', { ascending: false });

    return {
      id: teacher.id,
      employee_id: teacher.employee_id,
      full_name: teacher.full_name,
      photo: teacher.photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      phone: teacher.phone || '+1 (555) 000-0000',
      email: teacher.email || '',
      department: teacher.department || '',
      subjects: teacher.subjects || [],
      employment_date: teacher.employment_date || teacher.created_at,
      status: teacher.status || 'Active',
      weekly_load: teacher.weekly_load || '0 hrs/wk',
      assigned_grades: teacher.assigned_grades || [],
      assigned_sections: teacher.assigned_sections || [],
      performance_metrics: performanceMetrics || undefined,
      evaluations: evaluations || [],
      class_assignments: classAssignments || []
    };
  }

  /**
   * Update teacher record
   */
  async update(id: string, updateData: UpdateTeacherDto) {
    return this.supabaseService.updateTenantRecord('teachers', id, updateData);
  }

  /**
   * Delete teacher record
   */
  async delete(id: string) {
    return this.supabaseService.deleteTenantRecord('teachers', id);
  }

  /**
   * Deactivate teacher (soft delete)
   */
  async deactivate(id: string) {
    return this.update(id, { status: 'Deactivated' });
  }

  /**
   * Activate teacher
   */
  async activate(id: string) {
    return this.update(id, { status: 'Active' });
  }

  // ==========================================
  // PERFORMANCE METRICS METHODS
  // ==========================================

  /**
   * Create performance metrics for a teacher
   */
  async createPerformanceMetrics(metricsData: CreatePerformanceMetricsDto) {
    const schoolId = TenantContext.getSchoolId();
    if (!schoolId) {
      throw new InternalServerErrorException('Tenant context not resolved.');
    }

    const { data: teacher } = await this.findOne(metricsData.teacher_id);

    const metricsToCreate = {
      ...metricsData,
      school_id: schoolId,
      student_rating: metricsData.student_rating || 0,
      parent_rating: metricsData.parent_rating || 0,
      director_evaluation: metricsData.director_evaluation || 0,
      attendance_present: metricsData.attendance_present || 0,
      attendance_absent: metricsData.attendance_absent || 0,
      attendance_late: metricsData.attendance_late || 0,
      attendance_leave: metricsData.attendance_leave || 0,
      assignment_completion_rate: metricsData.assignment_completion_rate || 0,
      syllabus_completion_rate: metricsData.syllabus_completion_rate || 0,
      semester: metricsData.semester || 'Semester 1'
    };

    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('teacher_performance_metrics')
      .insert(metricsToCreate)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to create performance metrics: ${error.message}`);
    }

    return data;
  }

  /**
   * Get performance metrics for a teacher
   */
  async getPerformanceMetrics(teacherId: string, academicYear?: string) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    let query = client
      .from('teacher_performance_metrics')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('school_id', schoolId);

    if (academicYear) {
      query = query.eq('academic_year', academicYear);
    }

    const { data, error } = await query.order('academic_year', { ascending: false });

    if (error) {
      throw new BadRequestException(`Failed to retrieve performance metrics: ${error.message}`);
    }

    return data;
  }

  /**
   * Update performance metrics
   */
  async updatePerformanceMetrics(id: string, updateData: UpdatePerformanceMetricsDto) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('teacher_performance_metrics')
      .update(updateData)
      .eq('id', id)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to update performance metrics: ${error.message}`);
    }

    return data;
  }

  // ==========================================
  // EVALUATIONS METHODS
  // ==========================================

  /**
   * Create teacher evaluation
   */
  async createEvaluation(evaluationData: CreateEvaluationDto) {
    const schoolId = TenantContext.getSchoolId();
    if (!schoolId) {
      throw new InternalServerErrorException('Tenant context not resolved.');
    }

    const { data: teacher } = await this.findOne(evaluationData.teacher_id);

    const evaluationToCreate = {
      ...evaluationData,
      school_id: schoolId
    };

    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('teacher_evaluations')
      .insert(evaluationToCreate)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to create evaluation: ${error.message}`);
    }

    return data;
  }

  /**
   * Get evaluations for a teacher
   */
  async getEvaluations(teacherId: string, evaluationType?: string) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    let query = client
      .from('teacher_evaluations')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('school_id', schoolId);

    if (evaluationType) {
      query = query.eq('evaluation_type', evaluationType);
    }

    const { data, error } = await query.order('evaluation_date', { ascending: false });

    if (error) {
      throw new BadRequestException(`Failed to retrieve evaluations: ${error.message}`);
    }

    return data;
  }

  /**
   * Update evaluation
   */
  async updateEvaluation(id: string, updateData: UpdateEvaluationDto) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('teacher_evaluations')
      .update(updateData)
      .eq('id', id)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to update evaluation: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete evaluation
   */
  async deleteEvaluation(id: string) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { error } = await client
      .from('teacher_evaluations')
      .delete()
      .eq('id', id)
      .eq('school_id', schoolId);

    if (error) {
      throw new BadRequestException(`Failed to delete evaluation: ${error.message}`);
    }

    return { message: 'Evaluation deleted successfully' };
  }

  // ==========================================
  // CLASS ASSIGNMENTS METHODS
  // ==========================================

  /**
   * Create class assignment for teacher
   */
  async createClassAssignment(assignmentData: CreateClassAssignmentDto) {
    const schoolId = TenantContext.getSchoolId();
    if (!schoolId) {
      throw new InternalServerErrorException('Tenant context not resolved.');
    }

    const { data: teacher } = await this.findOne(assignmentData.teacher_id);

    const assignmentToCreate = {
      ...assignmentData,
      school_id: schoolId,
      role: assignmentData.role || 'Subject Teacher',
      semester: assignmentData.semester || 'Semester 1',
      is_active: true
    };

    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('teacher_class_assignments')
      .insert(assignmentToCreate)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to create class assignment: ${error.message}`);
    }

    // Update teacher's assigned grades and sections arrays
    await this.updateTeacherArrays(assignmentData.teacher_id, assignmentData.grade_level, assignmentData.section_name);

    return data;
  }

  /**
   * Get class assignments for a teacher
   */
  async getClassAssignments(teacherId: string, isActive?: boolean) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    let query = client
      .from('teacher_class_assignments')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('school_id', schoolId);

    if (isActive !== undefined) {
      query = query.eq('is_active', isActive);
    }

    const { data, error } = await query.order('assigned_date', { ascending: false });

    if (error) {
      throw new BadRequestException(`Failed to retrieve class assignments: ${error.message}`);
    }

    return data;
  }

  /**
   * Update class assignment
   */
  async updateClassAssignment(id: string, updateData: UpdateClassAssignmentDto) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('teacher_class_assignments')
      .update(updateData)
      .eq('id', id)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to update class assignment: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete class assignment
   */
  async deleteClassAssignment(id: string) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { error } = await client
      .from('teacher_class_assignments')
      .delete()
      .eq('id', id)
      .eq('school_id', schoolId);

    if (error) {
      throw new BadRequestException(`Failed to delete class assignment: ${error.message}`);
    }

    return { message: 'Class assignment deleted successfully' };
  }

  /**
   * Helper method to update teacher's assigned grades and sections arrays
   */
  private async updateTeacherArrays(teacherId: string, grade: string, section: string) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    // Get current teacher data
    const { data: teacher } = await client
      .from('teachers')
      .select('assigned_grades, assigned_sections')
      .eq('id', teacherId)
      .eq('school_id', schoolId)
      .single();

    if (!teacher) return;

    // Add grade and section if not already present
    const grades = teacher.assigned_grades || [];
    const sections = teacher.assigned_sections || [];

    if (!grades.includes(grade)) {
      grades.push(grade);
    }
    if (!sections.includes(section)) {
      sections.push(section);
    }

    // Update teacher
    await client
      .from('teachers')
      .update({ assigned_grades: grades, assigned_sections: sections })
      .eq('id', teacherId)
      .eq('school_id', schoolId);
  }
}
