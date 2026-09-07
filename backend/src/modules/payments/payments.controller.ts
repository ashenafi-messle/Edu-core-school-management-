import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Raise a new billing invoice
   * POST /payments
   */
  @Post()
  create(@Body() body: { student_id: string; invoice_number: string; title: string; amount: number; status?: string; due_date: string }) {
    return this.paymentsService.create(body);
  }

  /**
   * List all school invoices and dues (Tenant bounded)
   * GET /payments
   */
  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }

  /**
   * Get single invoice details (Tenant bounded)
   * GET /payments/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  /**
   * Process/update invoice payment status
   * PUT /payments/:id
   */
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.paymentsService.update(id, body);
  }

  /**
   * Cancel or remove an invoice
   * DELETE /payments/:id
   */
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.paymentsService.delete(id);
  }
}
