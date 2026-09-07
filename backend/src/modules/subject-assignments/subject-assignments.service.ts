import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { SupabaseService } from '../../common/database/supabase.service';
import { 
  CreateSubjectAssignmentDto, 
  UpdateSubjectAssignmentDto, 
  SubjectAssignmentFilterDto,
  AssignmentStatus 
} from './subject-assignments.dto';

@Injectable()
export class SubjectAssignmentsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get supabase() {
    return this.supabaseService.getClient();
  }

  async findAll(schoolId: string, filters?: SubjectAssignmentFilterDto) {
    let query = this.supabase
      .from('subject_assignments')
      .select(`
        *,
        teacher:teachers(id, full_name, email, subject_specialization),
        subject:subjects(id, subject_code, subject_name, category),
        academic_year:academic_years(id, year_name, current_semester)
      `)
      .eq('school_id', schoolId);

    if (filters?.teacher_id) {
      query = query.eq('teacher_id', filters.teacher_id);
    }

    if (filters?.subject_id) {
      query = query.eq('subject_id', filters.subject_id);
    }

    if (filters?.academic_year_id) {
      query = query.eq('academic_year_id', filters.academic_year_id);
    }

    if (filters?.semester) {
      query = query.eq('semester', filters.semester);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch subject assignments: ${error.message}`);
    }

    return data;
  }

  async findOne(id: string, schoolId: string) {
    const { data, error } = await this.supabase
      .from('subject_assignments')
      .select(`
        *,
        teacher:teachers(id, full_name, email, subject_specialization),
        subject:subjects(id, subject_code, subject_name, category),
        academic_year:academic_years(id, year_name, current_semester)
      `)
      .eq('id', id)
      .eq('school_id', schoolId)
      .single();

    if (error) {
      throw new NotFoundException(`Subject assignment with ID ${id} not found`);
    }

    return data;
  }

  async create(schoolId: string, createDto: CreateSubjectAssignmentDto) {
    // Check for duplicate assignment
    const { data: existing } = await this.supabase
      .from('subject_assignments')
      .select('id')
      .eq('teacher_id', createDto.teacher_id)
      .eq('subject_id', createDto.subject_id)
      .eq('academic_year_id', createDto.academic_year_id)
      .eq('semester', createDto.semester)
      .single();

    if (existing) {
      throw new ConflictException('This teacher is already assigned to this subject for the specified academic year and semester');
    }

    const { data, error } = await this.supabase
      .from('subject_assignments')
      .insert({
        school_id: schoolId,
        ...createDto,
        status: AssignmentStatus.ACTIVE
      })
      .select(`
        *,
        teacher:teachers(id, full_name, email, subject_specialization),
        subject:subjects(id, subject_code, subject_name, category),
        academic_year:academic_years(id, year_name, current_semester)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to create subject assignment: ${error.message}`);
    }

    return data;
  }

  async update(id: string, schoolId: string, updateDto: UpdateSubjectAssignmentDto) {
    const { data, error } = await this.supabase
      .from('subject_assignments')
      .update({
        ...updateDto,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('school_id', schoolId)
      .select(`
        *,
        teacher:teachers(id, full_name, email, subject_specialization),
        subject:subjects(id, subject_code, subject_name, category),
        academic_year:academic_years(id, year_name, current_semester)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to update subject assignment: ${error.message}`);
    }

    return data;
  }

  async remove(id: string, schoolId: string) {
    const { error } = await this.supabase
      .from('subject_assignments')
      .delete()
      .eq('id', id)
      .eq('school_id', schoolId);

    if (error) {
      throw new Error(`Failed to delete subject assignment: ${error.message}`);
    }

    return { message: 'Subject assignment deleted successfully' };
  }

  async getTeacherAssignments(teacherId: string, schoolId: string) {
    return this.findAll(schoolId, { teacher_id: teacherId });
  }

  async getSubjectAssignments(subjectId: string, schoolId: string) {
    return this.findAll(schoolId, { subject_id: subjectId });
  }

  async getAcademicYearAssignments(academicYearId: string, schoolId: string) {
    return this.findAll(schoolId, { academic_year_id: academicYearId });
  }
}