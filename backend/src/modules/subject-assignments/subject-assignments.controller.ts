import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { SubjectAssignmentsService } from './subject-assignments.service';
import { 
  CreateSubjectAssignmentDto, 
  UpdateSubjectAssignmentDto, 
  SubjectAssignmentFilterDto 
} from './subject-assignments.dto';

@Controller('subject-assignments')
export class SubjectAssignmentsController {
  constructor(private readonly subjectAssignmentsService: SubjectAssignmentsService) {}

  @Get()
  async findAll(
    @Query('teacher_id') teacherId?: string,
    @Query('subject_id') subjectId?: string,
    @Query('academic_year_id') academicYearId?: string,
    @Query('semester') semester?: string,
    @Query('status') status?: string,
  ) {
    const filters: SubjectAssignmentFilterDto = {};
    if (teacherId) filters.teacher_id = teacherId;
    if (subjectId) filters.subject_id = subjectId;
    if (academicYearId) filters.academic_year_id = academicYearId;
    if (semester) filters.semester = semester;
    if (status) filters.status = status as any;

    // This would need school_id from request context
    // For now, we'll use a placeholder
    return this.subjectAssignmentsService.findAll('placeholder-school-id', filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.subjectAssignmentsService.findOne(id, 'placeholder-school-id');
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateSubjectAssignmentDto) {
    return this.subjectAssignmentsService.create('placeholder-school-id', createDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSubjectAssignmentDto
  ) {
    return this.subjectAssignmentsService.update(id, 'placeholder-school-id', updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.subjectAssignmentsService.remove(id, 'placeholder-school-id');
  }

  @Get('teacher/:teacherId')
  async getTeacherAssignments(@Param('teacherId') teacherId: string) {
    return this.subjectAssignmentsService.getTeacherAssignments(teacherId, 'placeholder-school-id');
  }

  @Get('subject/:subjectId')
  async getSubjectAssignments(@Param('subjectId') subjectId: string) {
    return this.subjectAssignmentsService.getSubjectAssignments(subjectId, 'placeholder-school-id');
  }

  @Get('academic-year/:academicYearId')
  async getAcademicYearAssignments(@Param('academicYearId') academicYearId: string) {
    return this.subjectAssignmentsService.getAcademicYearAssignments(academicYearId, 'placeholder-school-id');
  }
}