import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

// PUT /api/users/[id]/password - Reset user password (tenant scoped)
export async function PUT(
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
    const body = await request.json();

    console.log('Received password reset request for user:', id);

    if (!body.password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Verify user exists in this school
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (userError || !user) {
      return NextResponse.json(
        { error: `User with ID '${id}' does not exist in your school.` },
        { status: 404 }
      );
    }

    // Use Supabase Admin API to update the user's password in auth
    // This requires the service role key which has admin privileges
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin client not configured' },
        { status: 500 }
      );
    }

    // Update user password using Supabase Auth Admin API
    let authError: { message: string } | null = null;
    let authUser;
    
    // First try to update by ID (assuming user exists in Auth)
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      id,
      { password: body.password }
    );

    if (updateError) {
      console.log('User not found in Auth by ID, trying to find by email...');
      authError = updateError;
      
      // If user not found by ID, try to find by email in Auth
      const { data: userList, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (!listError && userList) {
        // Find user by email in the Auth users list
        const authUserByEmail = userList.users.find(u => u.email === user.email);
        
        if (authUserByEmail) {
          console.log('Found user in Auth by email:', authUserByEmail.id);
          // Update password using the Auth user ID
          const { data: updateByEmailData, error: updateByEmailError } = await supabaseAdmin.auth.admin.updateUserById(
            authUserByEmail.id,
            { password: body.password }
          );
          
          if (updateByEmailError) {
            console.error('Failed to update password by email:', updateByEmailError);
            return NextResponse.json(
              { error: `Failed to update password: ${updateByEmailError.message}` },
              { status: 400 }
            );
          }
          
          authUser = updateByEmailData;
          authError = null;
          console.log('Password updated successfully using email lookup');
        } else {
          console.log('User not found in Auth by email either, creating new Auth user...');
          // User doesn't exist in Auth at all, create them
          const { data: createUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: user.email,
            password: body.password,
            email_confirm: true,
            user_metadata: {
              full_name: user.email?.split('@')[0] || 'User',
              school_id: schoolId
            }
          });
          
          if (createError) {
            console.error('Failed to create user in Auth:', createError);
            return NextResponse.json(
              { error: `Failed to create user in Auth: ${createError.message}` },
              { status: 400 }
            );
          }
          
          // Update the local user ID to match the Auth user ID
          await supabaseAdmin
            .from('users')
            .update({ id: createUser.user.id })
            .eq('id', id);
          
          authUser = createUser;
          authError = null;
          console.log('Created new Auth user and updated local user ID');
        }
      } else {
        console.error('Failed to list users in Auth:', listError);
        return NextResponse.json(
          { error: `Failed to access Auth system: ${listError?.message || 'Unknown error'}` },
          { status: 500 }
        );
      }
    } else {
      authUser = updateData;
      console.log('Password updated successfully using direct ID');
    }

    if (authError) {
      console.error('Failed to update password in Supabase Auth:', authError);
      return NextResponse.json(
        { error: `Failed to update password: ${String((authError as unknown as { message?: string })?.message || authError)}` },
        { status: 400 }
      );
    }

    console.log('Password updated successfully for user:', id);

    return NextResponse.json({ 
      message: 'Password reset successfully',
      userId: id
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}