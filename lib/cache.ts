/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Advanced caching utilities for Next.js API routes
import { unstable_cache } from 'next/cache';

// Cache configuration
export const CACHE_CONFIG = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 600, // 10 minutes
  VERY_LONG: 3600, // 1 hour
};

// Revalidation tags for cache invalidation
export const CACHE_TAGS = {
  USERS: 'users',
  SCHOOLS: 'schools',
  STUDENTS: 'students',
  TEACHERS: 'teachers',
  PARENTS: 'parents',
  ACADEMIC_YEARS: 'academic-years',
  ATTENDANCE: 'attendance',
  EXAMS: 'exams',
  PAYMENTS: 'payments',
  ANALYTICS: 'analytics',
};

/**
 * Create a cached version of any async function
 */
export function createCachedFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    revalidate?: number;
    tags?: string[];
    keyParts?: string[];
  } = {}
): T {
  const { revalidate = CACHE_CONFIG.MEDIUM, tags = [], keyParts = [] } = options;

  return unstable_cache(
    fn,
    keyParts,
    {
      revalidate,
      tags,
    }
  ) as T;
}

/**
 * Invalidate cache by tags
 */
export async function revalidateCache(tags: string[]): Promise<void> {
  try {
    // This will be handled by Next.js revalidation
    // Call this when data changes
    await Promise.all(
      tags.map(async (tag) => {
        // Trigger revalidation for this tag
        await fetch(`/api/revalidate?tag=${tag}`, { method: 'POST' }).catch(() => {});
      })
    );
  } catch (error) {
    console.error('Failed to revalidate cache:', error);
  }
}

/**
 * Generate cache key from parameters
 */
export function generateCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join(':');
  return `${prefix}:${sortedParams}`;
}

/**
 * Simple in-memory cache for frequently accessed data
 */
class InMemoryCache {
  private cache: Map<string, { data: any; expiry: number }> = new Map();

  set(key: string, data: any, ttl: number = CACHE_CONFIG.MEDIUM): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl * 1000,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  clearPattern(pattern: string): void {
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }
}

export const memoryCache = new InMemoryCache();
