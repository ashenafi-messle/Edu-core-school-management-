import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';

// POST /api/payments - Raise a new billing invoice
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
    const { student_id, invoice_number, title, amount, status, due_date } = body;

    const schoolId = requireSchoolId(request);

    if (!student_id || !invoice_number || !title || !amount || !due_date) {
      return NextResponse.json(
        { error: 'Student ID, invoice number, title, amount, and due date are required.' },
        { status: 400 }
      );
    }

    // Enforce unique invoice numbers within the school
    const { data: existing } = await supabaseAdmin
      .from('payments')
      .select('id')
      .eq('school_id', schoolId)
      .eq('invoice_number', invoice_number)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: `Invoice Number '${invoice_number}' already exists in your billing system.` },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('payments')
      .insert([{ student_id, invoice_number, title, amount, status, due_date, school_id: schoolId }])
      .select();

    if (error) {
      return NextResponse.json(
        { error: `Failed to create invoice: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/payments - List all school invoices and dues (tenant scoped)
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

    const { data, error } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: `Failed to retrieve invoices: ${error.message}` },
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
