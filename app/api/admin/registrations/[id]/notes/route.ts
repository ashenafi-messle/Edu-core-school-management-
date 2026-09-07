/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

// POST /api/admin/registrations/:id/notes - Add admin notes to a registration
export async function POST(
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
    
    const { notes } = body;
    
    // Validate notes
    if (!notes || typeof notes !== 'string') {
      return NextResponse.json(
        { error: 'Notes are required and must be a string' },
        { status: 400 }
      );
    }
    
    if (notes.trim().length === 0) {
      return NextResponse.json(
        { error: 'Notes cannot be empty' },
        { status: 400 }
      );
    }
    
    // Verify registration exists
    const { data: registration, error: fetchError } = await supabaseAdmin!
      .from('registrations')
      .select('id, admin_notes')
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
    
    // Append new notes to existing notes (if any)
    const existingNotes = registration.admin_notes || '';
    const timestamp = new Date().toISOString();
    const newNotes = existingNotes 
      ? `${existingNotes}\n\n---\n[${timestamp}] ${notes}`
      : `[${timestamp}] ${notes}`;
    
    // Update registration with new notes
    const { data: updatedRegistration, error: updateError } = await supabaseAdmin!
      .from('registrations')
      .update({
        admin_notes: newNotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', registrationId)
      .eq('school_id', schoolId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating registration notes:', updateError);
      return NextResponse.json(
        { error: 'Failed to update registration notes', details: updateError.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      registration: updatedRegistration,
      message: 'Notes added successfully'
    });
    
  } catch (error) {
    console.error('Error in admin registration notes API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/registrations/:id/notes - Update admin notes (replace entirely)
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
    
    const { notes } = body;
    
    // Validate notes
    if (notes !== undefined && typeof notes !== 'string') {
      return NextResponse.json(
        { error: 'Notes must be a string' },
        { status: 400 }
      );
    }
    
    // Verify registration exists
    const { data: registration, error: fetchError } = await supabaseAdmin!
      .from('registrations')
      .select('id')
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
    
    // Update registration with new notes
    const { data: updatedRegistration, error: updateError } = await supabaseAdmin!
      .from('registrations')
      .update({
        admin_notes: notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', registrationId)
      .eq('school_id', schoolId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating registration notes:', updateError);
      return NextResponse.json(
        { error: 'Failed to update registration notes', details: updateError.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      registration: updatedRegistration,
      message: 'Notes updated successfully'
    });
    
  } catch (error) {
    console.error('Error in admin registration notes API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}