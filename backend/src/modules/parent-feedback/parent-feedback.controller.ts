import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ParentFeedbackService } from './parent-feedback.service';
import {
  CreateFeedbackDto,
  UpdateFeedbackDto,
  ResolveFeedbackDto,
  ListFeedbackQuery
} from './parent-feedback.dto';

@Controller('parent-feedback')
export class ParentFeedbackController {
  constructor(private readonly parentFeedbackService: ParentFeedbackService) {}

  // ==========================================
  // BASIC FEEDBACK CRUD ENDPOINTS
  // ==========================================

  /**
   * Create new feedback
   * POST /parent-feedback
   */
  @Post()
  create(@Body() body: CreateFeedbackDto) {
    return this.parentFeedbackService.create(body);
  }

  /**
   * List all feedback with filtering
   * GET /parent-feedback
   */
  @Get()
  findAll(@Query() query?: ListFeedbackQuery) {
    return this.parentFeedbackService.findAll(query);
  }

  // ==========================================
  // SPECIAL ENDPOINTS (must come before :id routes)
  // ==========================================

  /**
   * Get feedback statistics
   * GET /parent-feedback/statistics
   */
  @Get('statistics')
  getStatistics() {
    return this.parentFeedbackService.getStatistics();
  }

  /**
   * Get feedback by parent
   * GET /parent-feedback/by-parent/:parentId
   */
  @Get('by-parent/:parentId')
  getByParent(@Param('parentId') parentId: string) {
    return this.parentFeedbackService.getByParent(parentId);
  }

  /**
   * Get feedback by student
   * GET /parent-feedback/by-student/:studentId
   */
  @Get('by-student/:studentId')
  getByStudent(@Param('studentId') studentId: string) {
    return this.parentFeedbackService.getByStudent(studentId);
  }

  // ==========================================
  // INDIVIDUAL FEEDBACK ENDPOINTS
  // ==========================================

  /**
   * Get specific feedback details
   * GET /parent-feedback/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.parentFeedbackService.findOne(id);
  }

  /**
   * Update feedback record
   * PUT /parent-feedback/:id
   */
  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateFeedbackDto) {
    return this.parentFeedbackService.update(id, body);
  }

  /**
   * Delete feedback record
   * DELETE /parent-feedback/:id
   */
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.parentFeedbackService.delete(id);
  }

  // ==========================================
  // RESOLUTION ENDPOINTS
  // ==========================================

  /**
   * Resolve feedback with response
   * POST /parent-feedback/:id/resolve
   */
  @Post(':id/resolve')
  resolve(@Param('id') id: string, @Body() body: ResolveFeedbackDto) {
    return this.parentFeedbackService.resolve(id, body);
  }

  /**
   * Update feedback status
   * PUT /parent-feedback/:id/status
   */
  @Put(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: 'pending' | 'in_progress' | 'resolved' | 'closed' }
  ) {
    return this.parentFeedbackService.updateStatus(id, body.status);
  }
}
