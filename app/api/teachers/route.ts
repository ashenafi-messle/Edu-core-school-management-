import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { getSchoolId } from '@/lib/tenant-context';

// Helper function to generate a random password
function generatePassword(length = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// Helper function to generate sequential employee ID
async function generateEmployeeId(schoolId: string): Promise<string> {
  if (!supabaseAdmin) {
    throw new Error('Database connection not configured');
  }

  // Get the count of teachers for this school
  const { data: countData } = await supabaseAdmin
    .from('teachers')
    .select('id', { count: 'exact' })
    .eq('school_id', schoolId);

  const count = countData?.length || 0;
  const nextNumber = count + 1;
  
  // Format as TCH-XXXXX (5 digits, padded with zeros)
  return `TCH-${String(nextNumber).padStart(5, '0')}`;
}

// POST /api/teachers - Register a teacher with enhanced fields
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
    const { 
      full_name, 
      department, 
      subjects,
      photo,
      phone,
      email,
      employment_date,
      status,
      weekly_load,
      assigned_grades,
      assigned_sections
    } = body;

    const schoolId = getSchoolId(request);

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required. Please ensure you are logged in with a valid school account.' },
        { status: 400 }
      );
    }

    if (!full_name || !email) {
      return NextResponse.json(
        { error: 'Full name and email are required.' },
        { status: 400 }
      );
    }

    // Enforce email uniqueness within this school
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('school_id', schoolId)
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: `User with email '${email}' already exists in this school.` },
        { status: 400 }
      );
    }

    // Generate sequential employee ID
    const employee_id = await generateEmployeeId(schoolId);

    // Generate a temporary password
    const temporaryPassword = generatePassword();

    // Create auth user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        full_name: full_name,
        role: 'teacher',
        employee_id: employee_id
      }
    });

    if (authError) {
      return NextResponse.json(
        { error: `Failed to create auth user: ${authError.message}` },
        { status: 400 }
      );
    }

    const authUserId = authData.user.id;

    // Create user record in users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert([{
        school_id: schoolId,
        email: email,
        full_name: full_name,
        role: 'teacher',
        phone: phone || null,
        status: 'active',
        auth_user_id: authUserId
      }])
      .select()
      .single();

    if (userError) {
      // Rollback: delete auth user if user creation fails
      await supabaseAdmin.auth.admin.deleteUser(authUserId);
      return NextResponse.json(
        { error: `Failed to create user record: ${userError.message}` },
        { status: 400 }
      );
    }

    const userId = userData.id;

    // Set default values for new fields
    const teacherData = {
      user_id: userId,
      employee_id,
      full_name,
      department,
      subjects,
      school_id: schoolId,
      photo: photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      phone: phone || '+1 (555) 000-0000',
      email: email,
      employment_date: employment_date || new Date().toISOString(),
      status: status || 'Active',
      weekly_load: weekly_load || '0 hrs/wk',
      assigned_grades: assigned_grades || [],
      assigned_sections: assigned_sections || []
    };

    const { data: teacherDataResult, error: teacherError } = await supabaseAdmin
      .from('teachers')
      .insert([teacherData])
      .select()
      .single();

    if (teacherError) {
      // Rollback: delete user and auth user if teacher creation fails
      await supabaseAdmin.from('users').delete().eq('id', userId);
      await supabaseAdmin.auth.admin.deleteUser(authUserId);
      return NextResponse.json(
        { error: `Failed to register teacher: ${teacherError.message}` },
        { status: 400 }
      );
    }

    // Return the teacher data along with the temporary password
    return NextResponse.json({
      ...teacherDataResult,
      temporary_password: temporaryPassword,
      message: 'Teacher created successfully. Temporary password provided for first login.'
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/teachers - List school teachers (tenant scoped)
export async function GET(request: NextRequest) {
  try {
    checkDatabaseConnection();
    

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    const schoolId = getSchoolId(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const department = searchParams.get('department');

    // If no school ID is provided, return empty array
    if (!schoolId) {
      console.warn('No school ID provided for teachers list, returning empty array');
      return NextResponse.json([]);
    }

    let query = supabaseAdmin
      .from('teachers')
      .select('*')
      .eq('school_id', schoolId);

    if (status) {
      query = query.eq('status', status);
    }

    if (department) {
      query = query.eq('department', department);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: `Failed to retrieve teachers: ${error.message}` },
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
