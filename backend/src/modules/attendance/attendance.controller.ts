import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { AttendanceService } from './attendance.service';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  /**
   * Log student attendance
   * POST /attendance
   */
  @Post()
  create(@Body() body: { student_id: string; class_date: string; status: string; remarks?: string; taken_by?: string }) {
    return this.attendanceService.create(body);
  }

  /**
   * List school attendance registers (Tenant bounded)
   * GET /attendance
   */
  @Get()
  findAll() {
    return this.attendanceService.findAll();
  }

  /**
   * Get attendance log details (Tenant bounded)
   * GET /attendance/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attendanceService.findOne(id);
  }

  /**
   * Update attendance record
   * PUT /attendance/:id
   */
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.attendanceService.update(id, body);
  }

  /**
   * Remove an attendance record
   * DELETE /attendance/:id
   */
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.attendanceService.delete(id);
  }
}
