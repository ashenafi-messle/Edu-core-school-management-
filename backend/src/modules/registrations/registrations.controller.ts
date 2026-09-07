import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import {
  CreateRegistrationDto,
  UpdateRegistrationDto,
  ListRegistrationsQuery
} from './registrations.dto';

@Controller('registrations')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  // ==========================================
  // BASIC REGISTRATION CRUD ENDPOINTS
  // ==========================================

  /**
   * Create new registration
   * POST /registrations
   */
  @Post()
  create(@Body() body: CreateRegistrationDto) {
    return this.registrationsService.create(body);
  }

  /**
   * List all registrations with filtering
   * GET /registrations
   */
  @Get()
  findAll(@Query() query?: ListRegistrationsQuery) {
    return this.registrationsService.findAll(query);
  }

  // ==========================================
  // SPECIAL ENDPOINTS (must come before :id routes)
  // ==========================================

  /**
   * Get parent-student mappings from approved/enrolled registrations
   * GET /registrations/mappings
   */
  @Get('mappings')
  getParentStudentMappings(@Query() query?: ListRegistrationsQuery) {
    return this.registrationsService.getParentStudentMappings(query);
  }

  /**
   * Get registration statistics
   * GET /registrations/statistics
   */
  @Get('statistics')
  getStatistics() {
    return this.registrationsService.getStatistics();
  }

  // ==========================================
  // INDIVIDUAL REGISTRATION ENDPOINTS
  // ==========================================

  /**
   * Get specific registration details
   * GET /registrations/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.registrationsService.findOne(id);
  }

  /**
   * Get registration with related student and parent data
   * GET /registrations/:id/profile
   */
  @Get(':id/profile')
  findOneWithRelatedData(@Param('id') id: string) {
    return this.registrationsService.findOneWithRelatedData(id);
  }

  /**
   * Update registration record
   * PUT /registrations/:id
   */
  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateRegistrationDto) {
    return this.registrationsService.update(id, body);
  }

  /**
   * Delete registration record
   * DELETE /registrations/:id
   */
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.registrationsService.delete(id);
  }

  // ==========================================
  // PARENT-STUDENT MAPPING ENDPOINTS
  // ==========================================

  /**
   * Link registration to existing parent and student records
   * POST /registrations/:id/link
   */
  @Post(':id/link')
  linkToExistingRecords(
    @Param('id') id: string,
    @Body() body: { parent_id?: string; student_id?: string }
  ) {
    return this.registrationsService.linkToExistingRecords(id, body.parent_id, body.student_id);
  }

  // ==========================================
  // STATUS MANAGEMENT ENDPOINTS
  // ==========================================

  /**
   * Update registration status
   * PUT /registrations/:id/status
   */
  @Put(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'enrolled'; reason?: string }
  ) {
    return this.registrationsService.updateStatus(id, body.status, body.reason);
  }
}
