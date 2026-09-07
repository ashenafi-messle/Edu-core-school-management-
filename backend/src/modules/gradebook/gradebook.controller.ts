import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { GradebookService } from './gradebook.service';
import { CreateGradebookEntryDto, UpdateGradebookEntryDto, BulkCreateGradebookEntryDto, CreateStudentGradeSummaryDto, UpdateStudentGradeSummaryDto, GradebookQueryDto, ClassGradebookQueryDto, ReportCardQueryDto } from './gradebook.dto';

@Controller('gradebook')
export class GradebookController {
  constructor(private readonly gradebookService: GradebookService) {}

  /**
   * Create a gradebook entry
   * POST /gradebook/entries
   */
  @Post('entries')
  createGradebookEntry(@Body() body: CreateGradebookEntryDto) {
    return this.gradebookService.createGradebookEntry(body);
  }

  /**
   * Bulk create gradebook entries
   * POST /gradebook/entries/bulk
   */
  @Post('entries/bulk')
  bulkCreateGradebookEntries(@Body() body: BulkCreateGradebookEntryDto) {
    return this.gradebookService.bulkCreateGradebookEntries(body);
  }

  /**
   * Get gradebook entries with filters
   * GET /gradebook/entries
   */
  @Get('entries')
  getGradebookEntries(@Query() query: GradebookQueryDto) {
    return this.gradebookService.getGradebookEntries(query);
  }

  /**
   * Get gradebook entry by ID
   * GET /gradebook/entries/:id
   */
  @Get('entries/:id')
  getGradebookEntry(@Param('id') id: string) {
    return this.gradebookService.getGradebookEntry(id);
  }

  /**
   * Update gradebook entry
   * PUT /gradebook/entries/:id
   */
  @Put('entries/:id')
  updateGradebookEntry(@Param('id') id: string, @Body() body: UpdateGradebookEntryDto) {
    return this.gradebookService.updateGradebookEntry(id, body);
  }

  /**
   * Delete gradebook entry
   * DELETE /gradebook/entries/:id
   */
  @Delete('entries/:id')
  deleteGradebookEntry(@Param('id') id: string) {
    return this.gradebookService.deleteGradebookEntry(id);
  }

  /**
   * Get student gradebook
   * GET /gradebook/student/:studentId
   */
  @Get('student/:studentId')
  getStudentGradebook(@Param('studentId') studentId: string, @Query() query: { term?: string; academic_year_id?: string }) {
    return this.gradebookService.getStudentGradebook(studentId, query);
  }

  /**
   * Get class gradebook
   * GET /gradebook/class
   */
  @Get('class')
  getClassGradebook(@Query() query: ClassGradebookQueryDto) {
    return this.gradebookService.getClassGradebook(query);
  }

  /**
   * Create or update student grade summary
   * POST /gradebook/summaries
   */
  @Post('summaries')
  createStudentGradeSummary(@Body() body: CreateStudentGradeSummaryDto) {
    return this.gradebookService.createStudentGradeSummary(body);
  }

  /**
   * Get student grade summary
   * GET /gradebook/summaries/:studentId
   */
  @Get('summaries/:studentId')
  getStudentGradeSummary(@Param('studentId') studentId: string, @Query() query: { term?: string; academic_year_id?: string }) {
    return this.gradebookService.getStudentGradeSummary(studentId, query);
  }

  /**
   * Update student grade summary
   * PUT /gradebook/summaries/:summaryId
   */
  @Put('summaries/:summaryId')
  updateStudentGradeSummary(@Param('summaryId') summaryId: string, @Body() body: UpdateStudentGradeSummaryDto) {
    return this.gradebookService.updateStudentGradeSummary(summaryId, body);
  }

  /**
   * Recalculate student grade summary
   * POST /gradebook/summaries/:studentId/recalculate
   */
  @Post('summaries/:studentId/recalculate')
  recalculateStudentSummary(@Param('studentId') studentId: string, @Query() query: { term?: string; academic_year_id?: string }) {
    return this.gradebookService.recalculateStudentSummary(studentId, query);
  }

  /**
   * Generate report card
   * GET /gradebook/report-card
   */
  @Get('report-card')
  generateReportCard(@Query() query: ReportCardQueryDto) {
    return this.gradebookService.generateReportCard(query);
  }

  /**
   * Get class performance analytics
   * GET /gradebook/analytics/class
   */
  @Get('analytics/class')
  getClassAnalytics(@Query() query: ClassGradebookQueryDto) {
    return this.gradebookService.getClassAnalytics(query);
  }

  /**
   * Get subject performance across classes
   * GET /gradebook/analytics/subject/:subjectId
   */
  @Get('analytics/subject/:subjectId')
  getSubjectPerformance(@Param('subjectId') subjectId: string, @Query() query: { grade_level?: string; term?: string; academic_year_id?: string }) {
    return this.gradebookService.getSubjectPerformance(subjectId, query);
  }
}
