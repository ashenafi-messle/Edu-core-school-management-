import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantContext } from '../context/tenant.context';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const schoolId = req.headers['x-school-id'] as string;

    // For public APIs (like login and schools registry), we allow continuing without a tenant
    const cleanPath = req.path.replace(/^\/api/, '');
    const isPublicPath = cleanPath.startsWith('/schools') || cleanPath === '/users/login';

    if (!schoolId && !isPublicPath) {
      // In a real application, if no tenant ID is present, we throw a BadRequestException
      // unless it's a completely public path.
      throw new BadRequestException('Tenant Identifier is required. Please specify the X-School-ID request header.');
    }

    if (schoolId) {
      // Execute the remainder of this request's lifecycle within the AsyncLocalStorage context
      TenantContext.run(schoolId, () => {
        next();
      });
    } else {
      next();
    }
  }
}
