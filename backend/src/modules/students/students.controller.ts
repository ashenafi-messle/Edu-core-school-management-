import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { StudentsService } from './students.service';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  /**
   * Enroll a student
   * POST /students
   */
  @Post()
  create(@Body() body: { user_id?: string; parent_id?: string; admission_number: string; full_name: string; grade_level: string; section?: string }) {
    return this.studentsService.create(body);
  }

  /**
   * List all student records (Tenant bounded)
   * GET /students
   */
  @Get()
  findAll() {
    return this.studentsService.findAll();
  }

  /**
   * Get single student details (Tenant bounded)
   * GET /students/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  /**
   * Update student profile
   * PUT /students/:id
   */
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.studentsService.update(id, body);
  }

  /**
   * Deregister student from school
   * DELETE /students/:id
   */
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.studentsService.delete(id);
  }
}
