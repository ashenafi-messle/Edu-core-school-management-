import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';
import { TenantContext } from '../context/tenant.context';

/**
 * Parameter decorator to automatically inject the current request's School Tenant ID.
 * Example:
 *   @Get()
 *   findAll(@TenantId() schoolId: string) { ... }
 */
export const TenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const schoolId = TenantContext.getSchoolId();
    if (!schoolId) {
      throw new BadRequestException('Request context lacks a valid School Tenant configuration.');
    }
    return schoolId;
  },
);
