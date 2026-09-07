/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Performance monitoring utilities
import { headers } from 'next/headers';

interface PerformanceMetrics {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  cached: boolean;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 1000; // Keep last 1000 metrics

  recordMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric);
    
    // Keep only the last maxMetrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getAverageResponseTime(endpoint?: string): number {
    const filtered = endpoint 
      ? this.metrics.filter(m => m.endpoint === endpoint)
      : this.metrics;
    
    if (filtered.length === 0) return 0;
    
    const total = filtered.reduce((sum, m) => sum + m.duration, 0);
    return total / filtered.length;
  }

  getSlowEndpoints(threshold: number = 1000): PerformanceMetrics[] {
    return this.metrics
      .filter(m => m.duration > threshold)
      .sort((a, b) => b.duration - a.duration);
  }

  getCacheHitRate(): number {
    if (this.metrics.length === 0) return 0;
    
    const cached = this.metrics.filter(m => m.cached).length;
    return (cached / this.metrics.length) * 100;
  }

  clear() {
    this.metrics = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * Middleware to track API performance
 */
export function withPerformanceTracking(
  handler: (request: Request) => Promise<Response>,
  options: { endpoint: string }
) {
  return async (request: Request) => {
    const startTime = performance.now();
    const method = request.method;
    
    try {
      const response = await handler(request);
      const duration = performance.now() - startTime;
      
      // Check if response was served from cache
      const cacheHeader = response.headers.get('X-Cache');
      const cached = cacheHeader === 'HIT';
      
      performanceMonitor.recordMetric({
        endpoint: options.endpoint,
        method,
        duration,
        status: response.status,
        cached,
        timestamp: Date.now(),
      });
      
      // Add performance headers
      const newResponse = new Response(response.body, response);
      newResponse.headers.set('X-Response-Time', `${duration.toFixed(2)}ms`);
      newResponse.headers.set('X-Cache-Status', cached ? 'HIT' : 'MISS');
      
      return newResponse;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      performanceMonitor.recordMetric({
        endpoint: options.endpoint,
        method,
        duration,
        status: 500,
        cached: false,
        timestamp: Date.now(),
      });
      
      throw error;
    }
  };
}

/**
 * Log slow queries
 */
export function logSlowQuery(query: string, duration: number, threshold: number = 500) {
  if (duration > threshold) {
    console.warn(`[SLOW QUERY] ${duration.toFixed(2)}ms - ${query.substring(0, 100)}...`);
  }
}

/**
 * Get client information for performance tracking
 */
export async function getClientInfo() {
  try {
    const headersList = await headers();
    return {
      userAgent: headersList.get('user-agent') || 'unknown',
      ip: headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown',
    };
  } catch {
    return {
      userAgent: 'unknown',
      ip: 'unknown',
    };
  }
}
