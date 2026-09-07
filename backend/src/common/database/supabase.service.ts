import { Injectable, Scope, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TenantContext } from '../context/tenant.context';

@Injectable({ scope: Scope.DEFAULT })
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || 'https://draqhsjzwyqnrrqgznud.supabase.co';
    const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyYXFoc2p6d3lxbnJycWd6bnVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MjAwMzcsImV4cCI6MjEwMDE5NjAzN30.JC5u7lKCZvsnSn4UHtf7LGXL5IdocbZjGAOgv5EGmPs';

    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase configuration is missing in environment variables. Falling back to placeholders.');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  /**
   * Retrieve the raw Supabase client for admin or un-scoped queries.
   */
  getClient(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Helper to retrieve a tenant-scoped builder for any database table.
   * Automatically injects a filter mapping to the active request's `school_id`.
   */
  fromTenantTable(tableName: string) {
    const schoolId = TenantContext.getSchoolId();
    if (!schoolId) {
      throw new InternalServerErrorException(
        'Database query halted: Active school tenant context is missing. Ensure X-School-ID header is provided.'
      );
    }

    // Programmatically chain the tenant filtering.
    // Together with the Postgres RLS policy, this constitutes multi-layered tenant isolation!
    return this.supabase.from(tableName).select().eq('school_id', schoolId);
  }

  /**
   * Enforce tenant ID during creation/insertion operations.
   */
  async insertTenantRecord(tableName: string, record: any) {
    const schoolId = TenantContext.getSchoolId();
    if (!schoolId) {
      throw new InternalServerErrorException('Tenant ID missing from context.');
    }

    const tenantScopedRecord = {
      ...record,
      school_id: schoolId,
    };

    const { data, error } = await this.supabase
      .from(tableName)
      .insert([tenantScopedRecord])
      .select();

    if (error) {
      throw new InternalServerErrorException(`Failed to create tenant record in ${tableName}: ${error.message}`);
    }

    return data[0];
  }

  /**
   * Enforce tenant ID during updating operations.
   */
  async updateTenantRecord(tableName: string, id: string, record: any) {
    const schoolId = TenantContext.getSchoolId();
    if (!schoolId) {
      throw new InternalServerErrorException('Tenant ID missing from context.');
    }

    const { data, error } = await this.supabase
      .from(tableName)
      .update(record)
      .eq('id', id)
      .eq('school_id', schoolId) // Enforce tenant boundaries
      .select();

    if (error) {
      throw new InternalServerErrorException(`Failed to update tenant record in ${tableName}: ${error.message}`);
    }

    return data[0];
  }

  /**
   * Enforce tenant ID during deletion operations.
   */
  async deleteTenantRecord(tableName: string, id: string) {
    const schoolId = TenantContext.getSchoolId();
    if (!schoolId) {
      throw new InternalServerErrorException('Tenant ID missing from context.');
    }

    const { data, error } = await this.supabase
      .from(tableName)
      .delete()
      .eq('id', id)
      .eq('school_id', schoolId) // Enforce tenant boundaries
      .select();

    if (error) {
      throw new InternalServerErrorException(`Failed to delete tenant record in ${tableName}: ${error.message}`);
    }

    return { deleted: true, record: data ? data[0] : null };
  }
}
