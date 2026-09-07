import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SchoolsService } from './schools.service';

@Controller('schools')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  /**
   * Onboard a new school
   * POST /schools
   */
  @Post()
  create(@Body() body: { name: string; subdomain: string; domain?: string }) {
    return this.schoolsService.create(body);
  }

  /**
   * List all schools (Admin module)
   * GET /schools
   */
  @Get()
  findAll() {
    return this.schoolsService.findAll();
  }

  /**
   * Get single school details
   * GET /schools/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schoolsService.findOne(id);
  }
}
