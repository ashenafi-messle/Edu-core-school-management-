import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

// POST /api/sections/allocations - Auto-allocate students to sections with gender balance
export async function POST(request: NextRequest) {
  try {
    checkDatabaseConnection();
    

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    const body = await request.json();
    const { grade_level, academic_year, students_per_section } = body;

    console.log('Allocation request received:', { grade_level, academic_year, students_per_section });

    let schoolId: string;
    try {
      schoolId = requireSchoolId(request);
      console.log('School ID from context:', schoolId);
    } catch (error) {
      console.error('Failed to get school ID:', error);
      return NextResponse.json(
        { error: 'School ID is required. Please select a school first.' },
        { status: 401 }
      );
    }

    if (!grade_level || !academic_year || !students_per_section) {
      return NextResponse.json(
        { error: 'Grade level, academic year, and students per section are required.' },
        { status: 400 }
      );
    }

    // Check if academic year is archived
    const { data: academicYearData, error: yearError } = await supabaseAdmin
      .from('academic_years')
      .select('is_archived')
      .eq('school_id', schoolId)
      .eq('year_name', academic_year)
      .single();

    if (yearError) {
      console.error('Failed to check academic year status:', yearError);
      return NextResponse.json(
        { error: 'Failed to verify academic year status' },
        { status: 400 }
      );
    }

    if (academicYearData && academicYearData.is_archived) {
      return NextResponse.json(
        { error: 'Cannot allocate students for archived academic years' },
        { status: 400 }
      );
    }

    console.log('Querying students for school:', schoolId, 'grade:', grade_level);

    // Get all students for the grade level who don't have a section yet
    const { data: students, error: studentsError } = await supabaseAdmin
      .from('students')
      .select('*')
      .eq('school_id', schoolId)
      .eq('grade_level', grade_level)
      .is('section', null)
      .order('full_name', { ascending: true });

    if (studentsError) {
      console.error('Failed to retrieve students:', studentsError);
      return NextResponse.json(
        { error: `Failed to retrieve students: ${studentsError.message}` },
        { status: 400 }
      );
    }

    console.log('Found students for allocation:', students?.length || 0);

    if (!students || students.length === 0) {
      return NextResponse.json(
        { error: 'No students found for this grade level without sections.' },
        { status: 400 }
      );
    }

    // Separate students by gender
    const maleStudents = students.filter(s => s.gender === 'male');
    const femaleStudents = students.filter(s => s.gender === 'female');
    const otherStudents = students.filter(s => s.gender === 'other' || !s.gender);

    // Calculate number of sections needed
    const totalStudents = students.length;
    const numSections = Math.ceil(totalStudents / students_per_section);

    // Get existing section configurations for this grade and year
    const { data: existingConfigs, error: configsError } = await supabaseAdmin
      .from('section_configurations')
      .select('*')
      .eq('school_id', schoolId)
      .eq('grade_level', grade_level)
      .eq('academic_year', academic_year)
      .eq('is_active', true);

    if (configsError) {
      console.error('Failed to retrieve section configurations:', configsError);
      // Check if table doesn't exist
      if (configsError.message.includes('does not exist') || configsError.message.includes('relation') || configsError.code === '42P01') {
        return NextResponse.json(
          { error: 'Section configuration table does not exist. Please run the database migration to create the section tables.' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: `Failed to retrieve section configurations: ${configsError.message}` },
        { status: 400 }
      );
    }

    // Create additional section configurations if needed
    let sectionConfigs = existingConfigs || [];
    const sectionNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];
    
    for (let i = sectionConfigs.length; i < numSections; i++) {
      try {
        const { data: newConfig, error: createError } = await supabaseAdmin
          .from('section_configurations')
          .insert([{
            school_id: schoolId,
            grade_level,
            section_name: `Section ${sectionNames[i]}`,
            max_capacity: students_per_section,
            current_count: 0,
            academic_year,
            is_active: true
          }])
          .select();

        if (createError) {
          console.error('Failed to create section configuration:', createError);
          // Check if table doesn't exist
          if (createError.message.includes('does not exist') || createError.message.includes('relation') || createError.code === '42P01') {
            return NextResponse.json(
              { error: 'Section configuration table does not exist. Please run the database migration to create the section tables.' },
              { status: 400 }
            );
          }
          return NextResponse.json(
            { error: `Failed to create section configuration: ${createError.message}` },
            { status: 400 }
          );
        }

        if (!newConfig || newConfig.length === 0) {
          return NextResponse.json(
            { error: 'Failed to create section configuration: No data returned' },
            { status: 400 }
          );
        }

        sectionConfigs.push(newConfig[0]);
      } catch (error: any) {
        console.error('Exception creating section configuration:', error);
        return NextResponse.json(
          { error: `Exception creating section configuration: ${error.message}` },
          { status: 400 }
        );
      }
    }

    // Sort section configs by name
    sectionConfigs.sort((a, b) => a.section_name.localeCompare(b.section_name));

    // Allocate students with gender balance (1:1 ratio as much as possible)
    const allocations = [];
    const sectionAllocations: { [key: string]: any[] } = {};
    
    // Initialize section allocations
    sectionConfigs.forEach(config => {
      sectionAllocations[config.id] = [];
    });

    // Function to add student to section
    const addToSection = (student: any, sectionId: string) => {
      sectionAllocations[sectionId].push(student);
    };

    // Distribute male and female students alternately across sections
    let sectionIndex = 0;
    
    // First, distribute students maintaining 1:1 gender ratio in each section
    const minGender = Math.min(maleStudents.length, femaleStudents.length);
    
    for (let i = 0; i < minGender; i++) {
      const sectionConfig = sectionConfigs[sectionIndex % sectionConfigs.length];
      addToSection(maleStudents[i], sectionConfig.id);
      addToSection(femaleStudents[i], sectionConfig.id);
      sectionIndex++;
    }

    // Add remaining male students
    for (let i = minGender; i < maleStudents.length; i++) {
      const sectionConfig = sectionConfigs[sectionIndex % sectionConfigs.length];
      addToSection(maleStudents[i], sectionConfig.id);
      sectionIndex++;
    }

    // Add remaining female students
    for (let i = minGender; i < femaleStudents.length; i++) {
      const sectionConfig = sectionConfigs[sectionIndex % sectionConfigs.length];
      addToSection(femaleStudents[i], sectionConfig.id);
      sectionIndex++;
    }

    // Add other/unknown gender students
    for (let i = 0; i < otherStudents.length; i++) {
      const sectionConfig = sectionConfigs[sectionIndex % sectionConfigs.length];
      addToSection(otherStudents[i], sectionConfig.id);
      sectionIndex++;
    }

    // Update students with their sections and create allocation records
    for (const config of sectionConfigs) {
      const allocatedStudents = sectionAllocations[config.id];
      
      for (const student of allocatedStudents) {
        // Update student's section
        const { error: updateError } = await supabaseAdmin
          .from('students')
          .update({ section: config.section_name })
          .eq('id', student.id);

        if (updateError) {
          return NextResponse.json(
            { error: `Failed to update student section: ${updateError.message}` },
            { status: 400 }
          );
        }

        // Create allocation record
        const { data: allocation, error: allocationError } = await supabaseAdmin
          .from('section_allocations')
          .insert([{
            school_id: schoolId,
            student_id: student.id,
            section_configuration_id: config.id,
            grade_level,
            section_name: config.section_name,
            allocation_method: 'auto',
            allocation_date: new Date().toISOString()
          }])
          .select();

        if (allocationError) {
          return NextResponse.json(
            { error: `Failed to create allocation record: ${allocationError.message}` },
            { status: 400 }
          );
        }

        allocations.push(allocation[0]);
      }

      // Update section configuration current count
      await supabaseAdmin
        .from('section_configurations')
        .update({ current_count: allocatedStudents.length })
        .eq('id', config.id);
    }

    return NextResponse.json({
      message: `Successfully allocated ${totalStudents} students to ${numSections} sections`,
      allocations,
      summary: sectionConfigs.map(config => ({
        section_name: config.section_name,
        total_students: sectionAllocations[config.id].length,
        male_count: sectionAllocations[config.id].filter(s => s.gender === 'male').length,
        female_count: sectionAllocations[config.id].filter(s => s.gender === 'female').length
      }))
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/sections/allocations - Get all allocations with filtering
export async function GET(request: NextRequest) {
  try {
    checkDatabaseConnection();
    

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    const schoolId = requireSchoolId(request);
    const { searchParams } = new URL(request.url);
    const gradeLevel = searchParams.get('grade_level');
    const academicYear = searchParams.get('academic_year');

    let query = supabaseAdmin
      .from('section_allocations')
      .select(`
        *,
        students:student_id(id, full_name, admission_number, gender),
        section_configurations:section_configuration_id(section_name, max_capacity, current_count)
      `)
      .eq('school_id', schoolId);

    if (gradeLevel) {
      query = query.eq('grade_level', gradeLevel);
    }
    if (academicYear) {
      // Note: section_allocations doesn't have academic_year directly, 
      // we'll need to join with section_configurations
      query = query.eq('section_configurations.academic_year', academicYear);
    }

    const { data, error } = await query.order('allocation_date', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: `Failed to retrieve allocations: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/sections/allocations - Disallocate students (remove from sections)
export async function DELETE(request: NextRequest) {
  try {
    checkDatabaseConnection();
    

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    const body = await request.json();
    const { student_ids, grade_level, academic_year } = body;

    let schoolId: string;
    try {
      schoolId = requireSchoolId(request);
    } catch (error) {
      console.error('Failed to get school ID:', error);
      return NextResponse.json(
        { error: 'School ID is required. Please select a school first.' },
        { status: 401 }
      );
    }

    if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
      return NextResponse.json(
        { error: 'Student IDs array is required' },
        { status: 400 }
      );
    }

    if (!grade_level || !academic_year) {
      return NextResponse.json(
        { error: 'Grade level and academic year are required' },
        { status: 400 }
      );
    }

    // Check if academic year is archived
    const { data: academicYearData, error: yearError } = await supabaseAdmin
      .from('academic_years')
      .select('is_archived')
      .eq('school_id', schoolId)
      .eq('year_name', academic_year)
      .single();

    if (yearError || !academicYearData) {
      return NextResponse.json(
        { error: 'Failed to verify academic year status' },
        { status: 400 }
      );
    }

    if (academicYearData.is_archived) {
      return NextResponse.json(
        { error: 'Cannot modify allocations for archived academic years' },
        { status: 400 }
      );
    }

    // Update students to remove their section assignment
    const { error: updateError } = await supabaseAdmin
      .from('students')
      .update({ section: null })
      .eq('school_id', schoolId)
      .eq('grade_level', grade_level)
      .in('id', student_ids);

    if (updateError) {
      console.error('Failed to disallocate students:', updateError);
      return NextResponse.json(
        { error: `Failed to disallocate students: ${updateError.message}` },
        { status: 400 }
      );
    }

    // Delete allocation records
    const { error: deleteError } = await supabaseAdmin
      .from('section_allocations')
      .delete()
      .eq('school_id', schoolId)
      .eq('grade_level', grade_level)
      .in('student_id', student_ids);

    if (deleteError) {
      console.error('Failed to delete allocation records:', deleteError);
      // Check if table doesn't exist
      if (deleteError.message.includes('does not exist') || deleteError.message.includes('relation') || deleteError.code === '42P01') {
        return NextResponse.json(
          { error: 'Section allocation table does not exist. Please run the database migration to create the section tables.' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: `Failed to delete allocation records: ${deleteError.message}` },
        { status: 400 }
      );
    }

    // Update section configuration counts
    const { data: updatedConfigs, error: configError } = await supabaseAdmin
      .from('section_configurations')
      .select('id, section_name')
      .eq('school_id', schoolId)
      .eq('grade_level', grade_level)
      .eq('academic_year', academic_year);

    if (!configError && updatedConfigs) {
      for (const config of updatedConfigs) {
        // Count current allocations for this section
        const { data: allocationCount, error: countError } = await supabaseAdmin
          .from('section_allocations')
          .select('id', { count: 'exact' })
          .eq('section_configuration_id', config.id);

        if (!countError && allocationCount !== null) {
          await supabaseAdmin
            .from('section_configurations')
            .update({ current_count: allocationCount })
            .eq('id', config.id);
        }
      }
    }

    return NextResponse.json({
      message: `Successfully disallocated ${student_ids.length} students`,
      disallocated_count: student_ids.length
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
