/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role for auth operations
const supabaseAuth = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// PUT /api/admin/registrations/:id/status - Update registration status
// Valid actions: verify_documents, approve, reject, enroll
export async function PUT(
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
    
    const schoolId = requireSchoolId(request);
    const { id: registrationId } = await params;
    const body = await request.json();
    
    const { action, rejection_reason } = body;
    
    // Validate action
    const validActions = ['verify_documents', 'approve', 'reject', 'enroll'];
    if (!action || !validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Fetch current registration
    const { data: currentRegistration, error: fetchError } = await supabaseAdmin!
      .from('registrations')
      .select('*')
      .eq('id', registrationId)
      .eq('school_id', schoolId)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Registration not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching registration:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch registration', details: fetchError.message },
        { status: 500 }
      );
    }
    
    // Build update object based on action
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    
    switch (action) {
      case 'verify_documents':
        // Move from pending to under_review
        if (currentRegistration.status !== 'pending') {
          return NextResponse.json(
            { error: 'Can only verify documents for pending registrations' },
            { status: 400 }
          );
        }
        updateData.status = 'under_review';
        updateData.review_started_at = new Date().toISOString();
        break;
        
      case 'approve':
        // Move from under_review to approved
        if (currentRegistration.status !== 'under_review') {
          return NextResponse.json(
            { error: 'Can only approve registrations that are under review' },
            { status: 400 }
          );
        }
        updateData.status = 'approved';
        updateData.approved_at = new Date().toISOString();
        
        // Generate temporary password for student
        const tempPassword = `Stud${Math.floor(1000 + Math.random() * 9000)}`;
        // Parent password will be generated later if needed
        updateData.admin_notes = currentRegistration.admin_notes 
          ? `${currentRegistration.admin_notes}\n\nStudent Temporary Password: ${tempPassword}`
          : `Student Temporary Password: ${tempPassword}`;
        
        // Create user and student records after approval
        try {
          // Generate admission number
          const admissionNumber = `ADM-${Date.now().toString().slice(-6)}`;
          
          // 1. Create or reuse student user in Supabase Auth and database
          const studentEmail = currentRegistration.student_email || 
            `student_${currentRegistration.reference_id.toLowerCase()}@temp.school`;
          
          let studentUser;
          let studentAuthUserId;
          
          // Check if user already exists in database
          const { data: existingStudentUser, error: studentCheckError } = await supabaseAdmin!
            .from('users')
            .select('*')
            .eq('school_id', schoolId)
            .eq('email', studentEmail)
            .single();
          
          if (studentCheckError && studentCheckError.code !== 'PGRST116') {
            console.error('Error checking student user:', studentCheckError);
          }
          
          if (existingStudentUser) {
            studentUser = existingStudentUser;
            studentAuthUserId = existingStudentUser.auth_user_id;
          } else {
            // Create user in Supabase Auth with temporary password
            const { data: authData, error: authError } = await supabaseAuth.auth.admin.createUser({
              email: studentEmail,
              password: tempPassword,
              email_confirm: true,
              user_metadata: {
                full_name: `${currentRegistration.student_first_name} ${currentRegistration.student_last_name}`,
                role: 'student'
              }
            });
            
            if (authError) {
              console.error('Error creating student auth user:', authError);
              return NextResponse.json(
                { error: 'Failed to create student authentication account', details: authError.message },
                { status: 500 }
              );
            }
            
            studentAuthUserId = authData.user.id;
            
            // Create user record in database
            const { data: newStudentUser, error: studentUserError } = await supabaseAdmin!
              .from('users')
              .insert({
                school_id: schoolId,
                email: studentEmail,
                full_name: `${currentRegistration.student_first_name} ${currentRegistration.student_last_name}`,
                role: 'student',
                phone: currentRegistration.student_phone,
                status: 'active',
                auth_user_id: studentAuthUserId
              })
              .select()
              .single();
            
            if (studentUserError) {
              console.error('Error creating student user:', studentUserError);
              return NextResponse.json(
                { error: 'Failed to create student user account', details: studentUserError.message },
                { status: 500 }
              );
            }
            studentUser = newStudentUser;
          }
          
          // 2. Create parent user record (check if parent email already exists)
          let parentUser;
          const { data: existingParentUser, error: parentCheckError } = await supabaseAdmin!
            .from('users')
            .select('*')
            .eq('school_id', schoolId)
            .eq('email', currentRegistration.parent_email)
            .single();
          
          if (parentCheckError && parentCheckError.code !== 'PGRST116') {
            console.error('Error checking parent user:', parentCheckError);
            // Continue anyway, we'll try to create
          }
          
          if (existingParentUser) {
            parentUser = existingParentUser;
          } else {
            // Create parent in Supabase Auth with temporary password
            const parentTempPassword = `Parent${Math.floor(1000 + Math.random() * 9000)}`;
            const { data: parentAuthData, error: parentAuthError } = await supabaseAuth.auth.admin.createUser({
              email: currentRegistration.parent_email,
              password: parentTempPassword,
              email_confirm: true,
              user_metadata: {
                full_name: `${currentRegistration.parent_first_name} ${currentRegistration.parent_last_name}`,
                role: 'parent'
              }
            });
            
            if (parentAuthError) {
              console.error('Error creating parent auth user:', parentAuthError);
              return NextResponse.json(
                { error: 'Failed to create parent authentication account', details: parentAuthError.message },
                { status: 500 }
              );
            }
            
            const parentAuthUserId = parentAuthData.user.id;
            
            // Add parent password to admin notes
            updateData.admin_notes = updateData.admin_notes 
              ? `${updateData.admin_notes}\nParent Temporary Password: ${parentTempPassword}`
              : `Parent Temporary Password: ${parentTempPassword}`;
            
            const { data: newParentUser, error: parentUserError } = await supabaseAdmin!
              .from('users')
              .insert({
                school_id: schoolId,
                email: currentRegistration.parent_email,
                full_name: `${currentRegistration.parent_first_name} ${currentRegistration.parent_last_name}`,
                role: 'parent',
                phone: currentRegistration.parent_phone,
                status: 'active',
                auth_user_id: parentAuthUserId
              })
              .select()
              .single();
            
            if (parentUserError) {
              console.error('Error creating parent user:', parentUserError);
              return NextResponse.json(
                { error: 'Failed to create parent user account', details: parentUserError.message },
                { status: 500 }
              );
            }
            parentUser = newParentUser;
          }
          
          // 3. Create parent record (check if parent record exists for the user)
          let parentRecord;
          const { data: existingParentRecord, error: parentRecordCheckError } = await supabaseAdmin!
            .from('parents')
            .select('*')
            .eq('school_id', schoolId)
            .eq('user_id', parentUser.id)
            .single();
          
          if (parentRecordCheckError && parentRecordCheckError.code !== 'PGRST116') {
            console.error('Error checking parent record:', parentRecordCheckError);
          }
          
          if (existingParentRecord) {
            parentRecord = existingParentRecord;
          } else {
            const { data: newParentRecord, error: parentRecordError } = await supabaseAdmin!
              .from('parents')
              .insert({
                school_id: schoolId,
                user_id: parentUser.id,
                full_name: `${currentRegistration.parent_first_name} ${currentRegistration.parent_last_name}`,
                relationship: currentRegistration.parent_relationship,
                emergency_contact: currentRegistration.emergency_contact_name && currentRegistration.emergency_phone
                  ? `${currentRegistration.emergency_contact_name} (${currentRegistration.emergency_phone})`
                  : null
              })
              .select()
              .single();
            
            if (parentRecordError) {
              console.error('Error creating parent record:', parentRecordError);
              return NextResponse.json(
                { error: 'Failed to create parent record', details: parentRecordError.message },
                { status: 500 }
              );
            }
            parentRecord = newParentRecord;
          }
          
          // 4. Create or update student record
          let studentRecord;
          const { data: existingStudentRecord, error: studentRecordCheckError } = await supabaseAdmin!
            .from('students')
            .select('*')
            .eq('school_id', schoolId)
            .eq('user_id', studentUser.id)
            .single();
          
          if (studentRecordCheckError && studentRecordCheckError.code !== 'PGRST116') {
            console.error('Error checking student record:', studentRecordCheckError);
          }
          
          if (existingStudentRecord) {
            // Update existing student record
            const { data: updatedStudentRecord, error: studentUpdateError } = await supabaseAdmin!
              .from('students')
              .update({
                parent_id: parentRecord.id,
                full_name: `${currentRegistration.student_first_name} ${currentRegistration.student_last_name}`,
                grade_level: currentRegistration.student_grade_level,
                gender: currentRegistration.student_gender,
                date_of_birth: currentRegistration.student_date_of_birth,
                phone: currentRegistration.student_phone,
                address: currentRegistration.student_address,
                city: currentRegistration.student_city,
                previous_school: currentRegistration.student_previous_school
              })
              .eq('id', existingStudentRecord.id)
              .select()
              .single();
            
            if (studentUpdateError) {
              console.error('Error updating student record:', studentUpdateError);
              return NextResponse.json(
                { error: 'Failed to update student record', details: studentUpdateError.message },
                { status: 500 }
              );
            }
            studentRecord = updatedStudentRecord;
          } else {
            // Create new student record
            const { data: newStudentRecord, error: studentRecordError } = await supabaseAdmin!
              .from('students')
              .insert({
                school_id: schoolId,
                user_id: studentUser.id,
                parent_id: parentRecord.id,
                admission_number: admissionNumber,
                full_name: `${currentRegistration.student_first_name} ${currentRegistration.student_last_name}`,
                grade_level: currentRegistration.student_grade_level,
                section: null, // Section can be assigned later
                gender: currentRegistration.student_gender,
                date_of_birth: currentRegistration.student_date_of_birth,
                phone: currentRegistration.student_phone,
                address: currentRegistration.student_address,
                city: currentRegistration.student_city,
                previous_school: currentRegistration.student_previous_school
              })
              .select()
              .single();
            
            if (studentRecordError) {
              console.error('Error creating student record:', studentRecordError);
              return NextResponse.json(
                { error: 'Failed to create student record', details: studentRecordError.message },
                { status: 500 }
              );
            }
            studentRecord = newStudentRecord;
          }
          
          // The parent-student relationship is established through the students table foreign key
          // No need to store these IDs in registrations table
          
        } catch (createError) {
          console.error('Error creating user/student records:', createError);
          return NextResponse.json(
            { error: 'Failed to create user and student records', details: createError instanceof Error ? createError.message : 'Unknown error' },
            { status: 500 }
          );
        }
        break;
        
      case 'reject':
        // Can reject from pending or under_review
        if (!['pending', 'under_review'].includes(currentRegistration.status)) {
          return NextResponse.json(
            { error: 'Can only reject pending or under review registrations' },
            { status: 400 }
          );
        }
        if (!rejection_reason) {
          return NextResponse.json(
            { error: 'Rejection reason is required when rejecting a registration' },
            { status: 400 }
          );
        }
        updateData.status = 'rejected';
        updateData.rejection_reason = rejection_reason;
        updateData.rejected_at = new Date().toISOString();
        break;
        
      case 'enroll':
        // Move from approved to enrolled
        if (currentRegistration.status !== 'approved') {
          return NextResponse.json(
            { error: 'Can only enroll approved registrations' },
            { status: 400 }
          );
        }
        updateData.status = 'enrolled';
        updateData.enrolled_at = new Date().toISOString();
        break;
    }
    
    // Update registration
    const { data: updatedRegistration, error: updateError } = await supabaseAdmin!
      .from('registrations')
      .update(updateData)
      .eq('id', registrationId)
      .eq('school_id', schoolId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating registration:', updateError);
      return NextResponse.json(
        { error: 'Failed to update registration', details: updateError.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      registration: updatedRegistration,
      message: `Registration ${action}d successfully`
    });
    
  } catch (error) {
    console.error('Error in admin registration status API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}