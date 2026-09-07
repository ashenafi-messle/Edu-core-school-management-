import { NextRequest } from 'next/server';

/**
 * Get school ID from request headers for tenant isolation
 */
export function getSchoolId(request: NextRequest): string | null {
  const schoolId = request.headers.get('X-School-ID');
  return schoolId;
}

/**
 * Validate school ID is present
 */
export function requireSchoolId(request: NextRequest): string {
  const schoolId = getSchoolId(request);
  if (!schoolId) {
    throw new Error('X-School-ID header is required.');
  }
  return schoolId;
}
