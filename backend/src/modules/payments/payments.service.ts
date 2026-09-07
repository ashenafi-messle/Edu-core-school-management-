import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../common/database/supabase.service';
import { TenantContext } from '../../common/context/tenant.context';

@Injectable()
export class PaymentsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Raise/Create a new invoice or fee record
   */
  async create(paymentData: { student_id: string; invoice_number: string; title: string; amount: number; status?: string; due_date: string }) {
    const schoolId = TenantContext.getSchoolId();
    if (!schoolId) {
      throw new InternalServerErrorException('Tenant context not resolved.');
    }

    const client = this.supabaseService.getClient();

    // Enforce unique invoice numbers within the school
    const { data: existing } = await client
      .from('payments')
      .select('id')
      .eq('school_id', schoolId)
      .eq('invoice_number', paymentData.invoice_number)
      .maybeSingle();

    if (existing) {
      throw new BadRequestException(`Invoice Number '${paymentData.invoice_number}' already exists in your billing system.`);
    }

    return this.supabaseService.insertTenantRecord('payments', paymentData);
  }

  /**
   * List all payments and outstanding dues of the active school
   */
  async findAll() {
    const { data, error } = await this.supabaseService.fromTenantTable('payments');
    if (error) {
      throw new BadRequestException(`Failed to retrieve invoices: ${error.message}`);
    }
    return data;
  }

  /**
   * Get single invoice/payment details
   */
  async findOne(id: string) {
    const schoolId = TenantContext.getSchoolId();
    const client = this.supabaseService.getClient();

    const { data, error } = await client
      .from('payments')
      .select('*')
      .eq('id', id)
      .eq('school_id', schoolId)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(`Failed to retrieve invoice record: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`Invoice with ID '${id}' does not exist inside your school ledger.`);
    }

    return data;
  }

  /**
   * Update payment status or record a payment transaction
   */
  async update(id: string, updateData: any) {
    delete updateData.school_id;
    return this.supabaseService.updateTenantRecord('payments', id, updateData);
  }

  /**
   * Revoke or delete an invoice
   */
  async delete(id: string) {
    return this.supabaseService.deleteTenantRecord('payments', id);
  }
}
