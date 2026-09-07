import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../common/database/supabase.service';
import { TenantContext } from '../../common/context/tenant.context';
import { CreateGradebookEntryDto, UpdateGradebookEntryDto, BulkCreateGradebookEntryDto, CreateStudentGradeSummaryDto, UpdateStudentGradeSummaryDto, GradebookQueryDto, ClassGradebookQueryDto, ReportCardQueryDto } from './gradebook.dto';

@Injectable()
export class GradebookService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Create a gradebook entry
   */
  async createGradebookEntry(entryData: CreateGradebookEntryDto) {
    const schoolId = TenantContext.getSchoolId();
    if (!schoolId) {
      throw new InternalServerErrorException('Tenant context not resolved.');
    }

    const client = this.supabaseService.getClient();
    const payload = {
      ...entryData,
      school_id: schoolId,
    };

    const { data, error } = await client
      .from('gradebook_entries')
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to create gradebook entry: ${error.message}`);
    }

    return data;
  }

  /**
   * Bulk create gradebook entries
   */
  async bulkCreateGradebookEntries(body: BulkCreateGradebookEntryDto) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const entries = body.entries.map(entry => ({
      ...entry,
      school_id: schoolId,
    }));

    const { data, error } = await client
      .from('gradebook_entries')
      .insert(entries)
      .select();

    if (error) {
      throw new BadRequestException(`Failed to bulk create gradebook entries: ${error.message}`);
    }

    return data;
  }

  /**
   * Get gradebook entries with filters
   */
  async getGradebookEntries(query: GradebookQueryDto) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    let dbQuery = client
      .from('gradebook_entries')
      .select('*, students(full_name, admission_number)')
      .eq('school_id', schoolId);

    // Apply filters
    if (query.student_id) dbQuery = dbQuery.eq('student_id', query.student_id);
    if (query.grade_level) dbQuery = dbQuery.eq('grade_level', query.grade_level);
    if (query.section_name) dbQuery = dbQuery.eq('section_name', query.section_name);
    if (query.subject_id) dbQuery = dbQuery.eq('subject_id', query.subject_id);
    if (query.term) dbQuery = dbQuery.eq('term', query.term);
    if (query.academic_year_id) dbQuery = dbQuery.eq('academic_year_id', query.academic_year_id);
    if (query.assessment_type) dbQuery = dbQuery.eq('assessment_type', query.assessment_type);
    if (query.start_date) dbQuery = dbQuery.gte('assessment_date', query.start_date);
    if (query.end_date) dbQuery = dbQuery.lte('assessment_date', query.end_date);

    const { data, error } = await dbQuery.order('assessment_date', { ascending: false });

    if (error) {
      throw new BadRequestException(`Failed to retrieve gradebook entries: ${error.message}`);
    }

    return data;
  }

  /**
   * Get gradebook entry by ID
   */
  async getGradebookEntry(id: string) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('gradebook_entries')
      .select('*, students(full_name, admission_number)')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(`Failed to retrieve gradebook entry: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Gradebook entry with ID '${id}' does not exist.`);
    }

    return data;
  }

  /**
   * Update gradebook entry
   */
  async updateGradebookEntry(id: string, entryData: UpdateGradebookEntryDto) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('gradebook_entries')
      .update(entryData)
      .eq('id', id)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to update gradebook entry: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Gradebook entry with ID '${id}' does not exist.`);
    }

    return data;
  }

  /**
   * Delete gradebook entry
   */
  async deleteGradebookEntry(id: string) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('gradebook_entries')
      .delete()
      .eq('id', id)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to delete gradebook entry: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Gradebook entry with ID '${id}' does not exist.`);
    }

    return { message: 'Gradebook entry deleted successfully' };
  }

  /**
   * Get student gradebook
   */
  async getStudentGradebook(studentId: string, query: { term?: string; academic_year_id?: string }) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    let dbQuery = client
      .from('gradebook_entries')
      .select('*')
      .eq('student_id', studentId)
      .eq('school_id', schoolId);

    if (query.term) dbQuery = dbQuery.eq('term', query.term);
    if (query.academic_year_id) dbQuery = dbQuery.eq('academic_year_id', query.academic_year_id);

    const { data, error } = await dbQuery.order('assessment_date', { ascending: false });

    if (error) {
      throw new BadRequestException(`Failed to retrieve student gradebook: ${error.message}`);
    }

    return data;
  }

  /**
   * Get class gradebook
   */
  async getClassGradebook(query: ClassGradebookQueryDto) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    let dbQuery = client
      .from('gradebook_entries')
      .select('*, students(full_name, admission_number)')
      .eq('school_id', schoolId)
      .eq('grade_level', query.grade_level);

    if (query.section_name) dbQuery = dbQuery.eq('section_name', query.section_name);
    if (query.subject_id) dbQuery = dbQuery.eq('subject_id', query.subject_id);
    if (query.term) dbQuery = dbQuery.eq('term', query.term);
    if (query.academic_year_id) dbQuery = dbQuery.eq('academic_year_id', query.academic_year_id);

    const { data, error } = await dbQuery.order('assessment_date', { ascending: false });

    if (error) {
      throw new BadRequestException(`Failed to retrieve class gradebook: ${error.message}`);
    }

    return data;
  }

  /**
   * Create or update student grade summary
   */
  async createStudentGradeSummary(summaryData: CreateStudentGradeSummaryDto) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    // Check if summary already exists
    const { data: existing } = await client
      .from('student_grade_summary')
      .select('id')
      .eq('student_id', summaryData.student_id)
      .eq('academic_year_id', summaryData.academic_year_id || null)
      .eq('term', summaryData.term || null)
      .maybeSingle();

    const payload = {
      ...summaryData,
      school_id: schoolId,
    };

    let result;
    if (existing) {
      // Update existing
      const { data, error } = await client
        .from('student_grade_summary')
        .update(summaryData)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        throw new BadRequestException(`Failed to update student grade summary: ${error.message}`);
      }
      result = data;
    } else {
      // Create new
      const { data, error } = await client
        .from('student_grade_summary')
        .insert(payload)
        .select()
        .single();

      if (error) {
        throw new BadRequestException(`Failed to create student grade summary: ${error.message}`);
      }
      result = data;
    }

    return result;
  }

  /**
   * Get student grade summary
   */
  async getStudentGradeSummary(studentId: string, query: { term?: string; academic_year_id?: string }) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    let dbQuery = client
      .from('student_grade_summary')
      .select('*, students(full_name, admission_number)')
      .eq('student_id', studentId)
      .eq('school_id', schoolId);

    if (query.term) dbQuery = dbQuery.eq('term', query.term);
    if (query.academic_year_id) dbQuery = dbQuery.eq('academic_year_id', query.academic_year_id);

    const { data, error } = await dbQuery.maybeSingle();

    if (error) {
      throw new BadRequestException(`Failed to retrieve student grade summary: ${error.message}`);
    }

    return data;
  }

  /**
   * Update student grade summary
   */
  async updateStudentGradeSummary(summaryId: string, summaryData: UpdateStudentGradeSummaryDto) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('student_grade_summary')
      .update(summaryData)
      .eq('id', summaryId)
      .eq('school_id', schoolId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to update student grade summary: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Student grade summary with ID '${summaryId}' does not exist.`);
    }

    return data;
  }

  /**
   * Recalculate student grade summary
   */
  async recalculateStudentSummary(studentId: string, query: { term?: string; academic_year_id?: string }) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    // Get all gradebook entries for the student
    let entriesQuery = client
      .from('gradebook_entries')
      .select('*')
      .eq('student_id', studentId)
      .eq('school_id', schoolId);

    if (query.term) entriesQuery = entriesQuery.eq('term', query.term);
    if (query.academic_year_id) entriesQuery = entriesQuery.eq('academic_year_id', query.academic_year_id);

    const { data: entries, error: entriesError } = await entriesQuery;

    if (entriesError) {
      throw new BadRequestException(`Failed to retrieve gradebook entries: ${entriesError.message}`);
    }

    if (!entries || entries.length === 0) {
      throw new BadRequestException('No gradebook entries found for this student.');
    }

    // Calculate statistics
    const totalAssessments = entries.length;
    const totalScore = entries.reduce((sum, entry) => sum + entry.percentage, 0);
    const overallAverage = totalScore / totalAssessments;

    // Calculate grade distribution
    const gradeDistribution = {
      a: entries.filter(e => e.letter_grade === 'A').length,
      b: entries.filter(e => e.letter_grade === 'B').length,
      c: entries.filter(e => e.letter_grade === 'C').length,
      d: entries.filter(e => e.letter_grade === 'D').length,
      f: entries.filter(e => e.letter_grade === 'F').length,
    };

    // Calculate GPA (4.0 scale)
    const gradePoints = entries.map(e => {
      switch (e.letter_grade) {
        case 'A': return 4.0;
        case 'B': return 3.0;
        case 'C': return 2.0;
        case 'D': return 1.0;
        default: return 0.0;
      }
    });
    const overallGpa = gradePoints.reduce((sum: number, gp) => sum + gp, 0) / gradePoints.length;

    // Get student info for grade_level and section
    const { data: student } = await client
      .from('students')
      .select('grade_level, section')
      .eq('id', studentId)
      .single();

    // Update or create summary
    const summaryData = {
      student_id: studentId,
      academic_year_id: query.academic_year_id || entries[0].academic_year_id,
      term: query.term || entries[0].term,
      grade_level: student?.grade_level || entries[0].grade_level,
      section_name: student?.section || entries[0].section_name,
      total_assessments: totalAssessments,
      assessments_completed: totalAssessments,
      overall_average: overallAverage,
      overall_gpa: overallGpa,
      total_a: gradeDistribution.a,
      total_b: gradeDistribution.b,
      total_c: gradeDistribution.c,
      total_d: gradeDistribution.d,
      total_f: gradeDistribution.f,
    };

    return this.createStudentGradeSummary(summaryData);
  }

  /**
   * Generate report card
   */
  async generateReportCard(query: ReportCardQueryDto) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    if (!query.student_id) {
      throw new BadRequestException('Student ID is required for report card generation.');
    }

    // Get student information
    const { data: student, error: studentError } = await client
      .from('students')
      .select('*, users(full_name)')
      .eq('id', query.student_id)
      .eq('school_id', schoolId)
      .single();

    if (studentError || !student) {
      throw new NotFoundException('Student not found.');
    }

    // Get student grade summary
    const summary = await this.getStudentGradeSummary(query.student_id, {
      term: query.term,
      academic_year_id: query.academic_year_id,
    });

    // Get gradebook entries grouped by subject
    let entriesQuery = client
      .from('gradebook_entries')
      .select('*')
      .eq('student_id', query.student_id)
      .eq('school_id', schoolId);

    if (query.term) entriesQuery = entriesQuery.eq('term', query.term);
    if (query.academic_year_id) entriesQuery = entriesQuery.eq('academic_year_id', query.academic_year_id);

    const { data: entries, error: entriesError } = await entriesQuery;

    if (entriesError) {
      throw new BadRequestException(`Failed to retrieve gradebook entries: ${entriesError.message}`);
    }

    // Group by subject
    const subjectPerformance: Record<string, any> = {};
    entries?.forEach(entry => {
      const subjectKey = entry.subject_name || 'Unknown';
      if (!subjectPerformance[subjectKey]) {
        subjectPerformance[subjectKey] = {
          subject_name: subjectKey,
          scores: [],
          grades: [],
        };
      }
      subjectPerformance[subjectKey].scores.push(entry.percentage);
      subjectPerformance[subjectKey].grades.push(entry.letter_grade);
    });

    // Calculate subject averages
    const subjectPerformanceArray = Object.values(subjectPerformance).map((subject: any) => ({
      subject_name: subject.subject_name,
      average: subject.scores.reduce((a: number, b: number) => a + b, 0) / subject.scores.length,
      grade: this.getLetterGrade(subject.scores.reduce((a: number, b: number) => a + b, 0) / subject.scores.length),
      assessments: subject.scores.length,
    }));

    const reportCard = {
      student_id: student.id,
      student_name: student.users?.full_name || student.full_name,
      admission_number: student.admission_number,
      grade_level: student.grade_level,
      section_name: student.section,
      academic_year: summary?.academic_year_id || 'N/A',
      term: summary?.term || 'N/A',
      overall_average: summary?.overall_average || 0,
      overall_gpa: summary?.overall_gpa || 0,
      class_rank: summary?.class_rank,
      total_students: summary?.total_students_in_class || 0,
      subject_performance: subjectPerformanceArray,
      grade_distribution: summary ? {
        a: summary.total_a,
        b: summary.total_b,
        c: summary.total_c,
        d: summary.total_d,
        f: summary.total_f,
      } : { a: 0, b: 0, c: 0, d: 0, f: 0 },
      attendance_percentage: summary?.attendance_percentage,
      class_teacher_remarks: summary?.class_teacher_remarks,
      principal_remarks: summary?.principal_remarks,
      generated_at: new Date().toISOString(),
    };

    return reportCard;
  }

  /**
   * Get class performance analytics
   */
  async getClassAnalytics(query: ClassGradebookQueryDto) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    // Get all gradebook entries for the class
    let entriesQuery = client
      .from('gradebook_entries')
      .select('*, students(full_name, admission_number)')
      .eq('school_id', schoolId)
      .eq('grade_level', query.grade_level);

    if (query.section_name) entriesQuery = entriesQuery.eq('section_name', query.section_name);
    if (query.subject_id) entriesQuery = entriesQuery.eq('subject_id', query.subject_id);
    if (query.term) entriesQuery = entriesQuery.eq('term', query.term);
    if (query.academic_year_id) entriesQuery = entriesQuery.eq('academic_year_id', query.academic_year_id);

    const { data: entries, error } = await entriesQuery;

    if (error) {
      throw new BadRequestException(`Failed to retrieve class analytics: ${error.message}`);
    }

    if (!entries || entries.length === 0) {
      return {
        grade_level: query.grade_level,
        section_name: query.section_name,
        total_students: 0,
        overall_average: 0,
        overall_gpa: 0,
        subject_performance: [],
      };
    }

    // Calculate overall statistics
    const totalStudents = new Set(entries.map(e => e.student_id)).size;
    const overallAverage = entries.reduce((sum, e) => sum + e.percentage, 0) / entries.length;

    // Calculate GPA
    const gradePoints = entries.map(e => {
      switch (e.letter_grade) {
        case 'A': return 4.0;
        case 'B': return 3.0;
        case 'C': return 2.0;
        case 'D': return 1.0;
        default: return 0.0;
      }
    });
    const overallGpa = gradePoints.reduce((sum: number, gp) => sum + gp, 0) / gradePoints.length;

    // Group by subject
    const subjectGroups: Record<string, any> = {};
    entries.forEach(entry => {
      const subjectKey = entry.subject_name || 'Unknown';
      if (!subjectGroups[subjectKey]) {
        subjectGroups[subjectKey] = {
          subject_name: subjectKey,
          subject_id: entry.subject_id,
          scores: [],
          grades: [],
          students: new Set(),
        };
      }
      subjectGroups[subjectKey].scores.push(entry.percentage);
      subjectGroups[subjectKey].grades.push(entry.letter_grade);
      subjectGroups[subjectKey].students.add(entry.student_id);
    });

    const subjectPerformance = Object.values(subjectGroups).map((group: any) => ({
      subject_id: group.subject_id,
      subject_name: group.subject_name,
      average_score: group.scores.reduce((a: number, b: number) => a + b, 0) / group.scores.length,
      highest_score: Math.max(...group.scores),
      lowest_score: Math.min(...group.scores),
      total_students: group.students.size,
      grade_distribution: {
        a: group.grades.filter((g: string) => g === 'A').length,
        b: group.grades.filter((g: string) => g === 'B').length,
        c: group.grades.filter((g: string) => g === 'C').length,
        d: group.grades.filter((g: string) => g === 'D').length,
        f: group.grades.filter((g: string) => g === 'F').length,
      },
    }));

    return {
      grade_level: query.grade_level,
      section_name: query.section_name,
      total_students: totalStudents,
      overall_average: overallAverage,
      overall_gpa: overallGpa,
      subject_performance: subjectPerformance,
      term: query.term,
      academic_year_id: query.academic_year_id,
    };
  }

  /**
   * Get subject performance across classes
   */
  async getSubjectPerformance(subjectId: string, query: { grade_level?: string; term?: string; academic_year_id?: string }) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    let dbQuery = client
      .from('gradebook_entries')
      .select('*, students(full_name, admission_number, grade_level, section)')
      .eq('school_id', schoolId)
      .eq('subject_id', subjectId);

    if (query.grade_level) dbQuery = dbQuery.eq('grade_level', query.grade_level);
    if (query.term) dbQuery = dbQuery.eq('term', query.term);
    if (query.academic_year_id) dbQuery = dbQuery.eq('academic_year_id', query.academic_year_id);

    const { data: entries, error } = await dbQuery;

    if (error) {
      throw new BadRequestException(`Failed to retrieve subject performance: ${error.message}`);
    }

    if (!entries || entries.length === 0) {
      return {
        subject_id: subjectId,
        subject_name: 'Unknown',
        average_score: 0,
        highest_score: 0,
        lowest_score: 0,
        total_students: 0,
        grade_distribution: { a: 0, b: 0, c: 0, d: 0, f: 0 },
      };
    }

    const subjectName = entries[0].subject_name || 'Unknown';
    const scores = entries.map(e => e.percentage);
    const grades = entries.map(e => e.letter_grade);
    const totalStudents = new Set(entries.map(e => e.student_id)).size;

    return {
      subject_id: subjectId,
      subject_name: subjectName,
      average_score: scores.reduce((a, b) => a + b, 0) / scores.length,
      highest_score: Math.max(...scores),
      lowest_score: Math.min(...scores),
      total_students: totalStudents,
      grade_distribution: {
        a: grades.filter(g => g === 'A').length,
        b: grades.filter(g => g === 'B').length,
        c: grades.filter(g => g === 'C').length,
        d: grades.filter(g => g === 'D').length,
        f: grades.filter(g => g === 'F').length,
      },
    };
  }

  /**
   * Helper function to get letter grade from percentage
   */
  private getLetterGrade(percentage: number): string {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }
}
