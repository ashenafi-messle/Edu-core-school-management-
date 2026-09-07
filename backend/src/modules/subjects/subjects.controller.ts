import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import {
  CreateSubjectDto,
  UpdateSubjectDto
} from './subjects.dto';

@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  /**
   * Create a new subject
   * POST /subjects
   */
  @Post()
  create(@Body() body: CreateSubjectDto) {
    return this.subjectsService.create(body);
  }

  /**
   * Get all subjects with optional filters
   * GET /subjects?category=Core&status=Active
   */
  @Get()
  findAll(@Query('category') category?: string, @Query('status') status?: string) {
    const filters: any = {};
    if (category) filters.category = category;
    if (status) filters.status = status;
    
    return this.subjectsService.findAll(Object.keys(filters).length > 0 ? filters : undefined);
  }

  /**
   * Get a specific subject by ID
   * GET /subjects/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subjectsService.findOne(id);
  }

  /**
   * Update a subject
   * PUT /subjects/:id
   */
  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateSubjectDto) {
    return this.subjectsService.update(id, body);
  }

  /**
   * Delete a subject
   * DELETE /subjects/:id
   */
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.subjectsService.delete(id);
  }

  /**
   * Archive a subject (soft delete)
   * PUT /subjects/:id/archive
   */
  @Put(':id/archive')
  archive(@Param('id') id: string) {
    return this.subjectsService.archive(id);
  }

  /**
   * Activate a subject
   * PUT /subjects/:id/activate
   */
  @Put(':id/activate')
  activate(@Param('id') id: string) {
    return this.subjectsService.activate(id);
  }
}