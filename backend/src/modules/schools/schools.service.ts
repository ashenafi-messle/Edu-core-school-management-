import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../common/database/supabase.service';

@Injectable()
export class SchoolsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Onboard/Create a new School Tenant
   */
  async create(schoolData: { name: string; subdomain: string; domain?: string }) {
    if (!schoolData.name || !schoolData.subdomain) {
      throw new BadRequestException('School name and subdomain are required.');
    }

    const client = this.supabaseService.getClient();

    // Prevent duplicate subdomain registries
    const { data: existing } = await client
      .from('schools')
      .select('id')
      .eq('subdomain', schoolData.subdomain)
      .maybeSingle();

    if (existing) {
      throw new ConflictException(`The subdomain '${schoolData.subdomain}' is already registered.`);
    }

    const { data, error } = await client
      .from('schools')
      .insert([schoolData])
      .select();

    if (error) {
      throw new BadRequestException(`Failed to onboard school tenant: ${error.message}`);
    }

    return data[0];
  }

  /**
   * Find all registered school tenants (Admin level)
   */
  async findAll() {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('schools')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new BadRequestException(`Failed to retrieve school tenants: ${error.message}`);
    }

    return data;
  }

  /**
   * Find a specific school tenant
   */
  async findOne(id: string) {
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('schools')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(`Failed to query school details: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException(`School Tenant with ID '${id}' does not exist.`);
    }

    return data;
  }
}
