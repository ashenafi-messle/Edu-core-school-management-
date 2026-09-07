import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ParentsService } from './parents.service';
import {
  CreateParentDto,
  UpdateParentDto,
  ListParentsQueryDto
} from './parents.dto';

@Controller('parents')
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  // ==========================================
  // BASIC PARENT CRUD ENDPOINTS
  // ==========================================

  /**
   * Register parent
   * POST /parents
   */
  @Post()
  create(@Body() body: CreateParentDto) {
    return this.parentsService.create(body);
  }

  /**
   * List school parents (Tenant bounded)
   * GET /parents
   */
  @Get()
  findAll(@Query() query?: ListParentsQueryDto) {
    return this.parentsService.findAll(query);
  }

  /**
   * Get parent details with user information (Tenant bounded)
   * GET /parents/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.parentsService.findOne(id);
  }

  /**
   * Get complete parent profile with associated students count
   * GET /parents/:id/profile
   */
  @Get(':id/profile')
  getProfile(@Param('id') id: string) {
    return this.parentsService.getProfile(id);
  }

  /**
   * Get parent's associated students
   * GET /parents/:id/students
   */
  @Get(':id/students')
  getStudents(@Param('id') id: string) {
    return this.parentsService.getStudents(id);
  }

  /**
   * Update parent profile
   * PUT /parents/:id
   */
  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateParentDto) {
    return this.parentsService.update(id, body);
  }

  /**
   * Deactivate parent (soft delete)
   * PUT /parents/:id/deactivate
   */
  @Put(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.parentsService.deactivate(id);
  }

  /**
   * Activate parent
   * PUT /parents/:id/activate
   */
  @Put(':id/activate')
  activate(@Param('id') id: string) {
    return this.parentsService.activate(id);
  }

  /**
   * Deregister parent
   * DELETE /parents/:id
   */
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.parentsService.delete(id);
  }
}
