import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

// GET /api/users/[id] - Get single user (tenant scoped)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ [key: string]: string }> }
) {
  try {
    checkDatabaseConnection();

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    const schoolId = requireSchoolId(request);
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: `Failed to load user: ${error.message}` },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: `User with ID '${id}' does not exist in your school.` },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update user (tenant scoped)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }

    const schoolId = requireSchoolId(request);
    const { id } = await params;
    const body = await request.json();

    console.log('Received update request for user:', id, 'with data:', body);

    // Clean school_id from payload to block tenant hijacking attempts
    delete body.school_id;

    // Extract role-specific data and fields not in database schema
    const { grade_level, section, department, subjects, relationship, emergency_contact, bio, ...userUpdateData } = body;

    // Map frontend field names to database field names and normalize values
    const mappedUpdateData: any = {
      ...userUpdateData,
      // Handle name/full_name mapping
      ...(userUpdateData.name && { full_name: userUpdateData.name, name: undefined }),
      // Normalize status to lowercase
      ...(userUpdateData.status && { status: userUpdateData.status.toLowerCase() })
    };

    console.log('Mapped update data for users table:', mappedUpdateData);

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(mappedUpdateData)
      .eq('id', id)
      .eq('school_id', schoolId)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Database update error:', error);
      return NextResponse.json(
        { error: `Failed to update user: ${error.message}` },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: `User with ID '${id}' does not exist in your school.` },
        { status: 404 }
      );
    }

    console.log('User updated successfully:', data);

    // Update role-specific tables based on user role
    if (data.role === 'student') {
      // Update students table
      if (grade_level || section) {
        console.log('Updating student record with grade_level:', grade_level, 'section:', section);
        
        const studentUpdateData: any = {};
        if (grade_level) studentUpdateData.grade_level = grade_level;
        if (section) studentUpdateData.section = section;
        if (mappedUpdateData.full_name) studentUpdateData.full_name = mappedUpdateData.full_name;
        
        const { data: studentData, error: studentError } = await supabaseAdmin
          .from('students')
          .update(studentUpdateData)
          .eq('user_id', id)
          .eq('school_id', schoolId)
          .select()
          .maybeSingle();

        if (studentError) {
          console.error('Failed to update student record:', studentError);
        } else if (studentData) {
          console.log(`Updated student record for user ${id}:`, studentData);
        } else {
          console.warn(`No student record found for user_id: ${id}`);
        }
      }
    } else if (data.role === 'teacher') {
      // Update teachers table
      if (department || subjects || mappedUpdateData.full_name) {
        console.log('Updating teacher record');
        
        const teacherUpdateData: any = {};
        if (department) teacherUpdateData.department = department;
        if (subjects) teacherUpdateData.subjects = subjects;
        if (mappedUpdateData.full_name) teacherUpdateData.full_name = mappedUpdateData.full_name;
        
        const { data: teacherData, error: teacherError } = await supabaseAdmin
          .from('teachers')
          .update(teacherUpdateData)
          .eq('user_id', id)
          .eq('school_id', schoolId)
          .select()
          .maybeSingle();

        if (teacherError) {
          console.error('Failed to update teacher record:', teacherError);
        } else if (teacherData) {
          console.log(`Updated teacher record for user ${id}:`, teacherData);
        } else {
          console.warn(`No teacher record found for user_id: ${id}`);
        }
      }
    } else if (data.role === 'parent') {
      // Update parents table
      if (relationship || emergency_contact || mappedUpdateData.full_name) {
        console.log('Updating parent record');
        
        const parentUpdateData: any = {};
        if (relationship) parentUpdateData.relationship = relationship;
        if (emergency_contact) parentUpdateData.emergency_contact = emergency_contact;
        if (mappedUpdateData.full_name) parentUpdateData.full_name = mappedUpdateData.full_name;
        
        const { data: parentData, error: parentError } = await supabaseAdmin
          .from('parents')
          .update(parentUpdateData)
          .eq('user_id', id)
          .eq('school_id', schoolId)
          .select()
          .maybeSingle();

        if (parentError) {
          console.error('Failed to update parent record:', parentError);
        } else if (parentData) {
          console.log(`Updated parent record for user ${id}:`, parentData);
        } else {
          console.warn(`No parent record found for user_id: ${id}`);
        }
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user (tenant scoped)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }

    const schoolId = requireSchoolId(request);
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id)
      .eq('school_id', schoolId)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete user: ${error.message}` },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: `User with ID '${id}' does not exist in your school.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
