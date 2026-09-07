/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// Helper function to get school ID with fallback
async function getSchoolIdWithFallback(request: NextRequest): Promise<string | null> {
  let schoolId = getSchoolId(request);
  
  if (!schoolId && supabaseAdmin) {
    const { data: school } = await supabaseAdmin
      .from('schools')
      .select('id')
      .limit(1)
      .single();
    
    if (school) {
      schoolId = school.id;
    }
  }
  
  return schoolId;
}

// GET /api/students/[id]/curriculum - Get curriculum documents accessible to a student
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    checkDatabaseConnection();
    

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    const schoolId = await getSchoolIdWithFallback(request);
    if (!schoolId) {
      return NextResponse.json(
        { error: 'No school found. Please create a school first.' },
        { status: 400 }
      );
    }
    
    const { id: identifier } = await params;
    const { searchParams } = new URL(request.url);
    const subject_id = searchParams.get('subject_id');
    const document_type = searchParams.get('document_type');
    const grade_level = searchParams.get('grade_level');
    const section_name = searchParams.get('section_name');

    // Get student details to determine grade level and section
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(identifier);
    let studentQuery = supabaseAdmin
      .from('students')
      .select('id, grade_level, section, school_id')
      .eq('school_id', schoolId);
    studentQuery = isUuid
      ? studentQuery.or(`id.eq.${identifier},user_id.eq.${identifier}`)
      : studentQuery.eq('user_id', identifier);
    const { data: student, error: studentError } = await studentQuery.maybeSingle();

    if (studentError || !student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    const { data: allocations } = await supabaseAdmin
      .from('subject_assignments')
      .select('subject_id, teacher_id')
      .eq('school_id', schoolId)
      .eq('grade_level', student.grade_level)
      .eq('section_name', student.section || '')
      .eq('status', 'Active');
    const allocatedSubjectIds = new Set((allocations || []).map(assignment => assignment.subject_id));
    const allocatedTeacherIds = new Set((allocations || []).map(assignment => assignment.teacher_id));
    const allocatedPairs = new Set((allocations || []).map(assignment => `${assignment.teacher_id}:${assignment.subject_id}`));

    // Build query for curriculum documents
    // Students can access:
    // 1. Published documents (status = 'published')
    // 2. Public documents (is_public = true)
    // 3. Documents matching their grade level and section
    // 4. Documents shared with them via curriculum_shares
    
    let query = supabaseAdmin
      .from('curriculum_documents')
      .select(`
        *,
        teacher:teachers(
          id,
          full_name,
          employee_id
        ),
        subject:subjects(
          id,
          subject_name,
          subject_code
        )
      `)
      .eq('school_id', schoolId)
      .neq('status', 'archived');

    // Filter by student's grade level and section if not explicitly provided
    const filterGradeLevel = grade_level || student.grade_level;
    const filterSection = section_name || student.section;

    if (subject_id) {
      query = query.eq('subject_id', subject_id);
    }

    if (document_type) {
      query = query.eq('document_type', document_type);
    }

    const { data: documents, error } = await query.order('created_at', { ascending: false });

    if (error) {
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('Curriculum documents table does not exist yet, returning empty array');
        return NextResponse.json([]);
      }
      return NextResponse.json(
        { error: `Failed to fetch curriculum documents: ${error.message}` },
        { status: 400 }
      );
    }

    // Filter documents to only include those that are public or match student's criteria
    const normalize = (value: unknown) => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const normalizedGrade = normalize(filterGradeLevel);
    const normalizedSection = normalize(filterSection);
    const accessibleDocuments = (documents || []).filter(doc => {
      const documentGrade = normalize(doc.grade_level);
      const documentSection = normalize(doc.section_name);
      const gradeMatches = !documentGrade || documentGrade === normalizedGrade;
      const sectionMatches = !documentSection || documentSection === normalizedSection;
      const subjectMatches = !doc.subject_id || allocatedSubjectIds.has(doc.subject_id);
      const teacherMatches = !doc.teacher_id || allocatedTeacherIds.has(doc.teacher_id);
      const allocationMatches = !doc.teacher_id || !doc.subject_id || allocatedPairs.has(`${doc.teacher_id}:${doc.subject_id}`);
      return doc.is_public || (gradeMatches && sectionMatches && subjectMatches && teacherMatches && allocationMatches);
    });

    return NextResponse.json(accessibleDocuments);
  } catch (error) {
    console.error('Error in GET /api/students/[id]/curriculum:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}