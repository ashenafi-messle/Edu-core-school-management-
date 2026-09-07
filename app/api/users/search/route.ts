import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, checkDatabaseConnection } from '@/lib/supabase';
import { requireSchoolId } from '@/lib/tenant-context';
import { memoryCache, CACHE_CONFIG } from '@/lib/cache';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ [key: string]: string }> }
) {
  try {
    checkDatabaseConnection();

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }
    
    const schoolId = await requireSchoolId(request);
    if (!schoolId) {
      return NextResponse.json({ error: 'School ID required' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ users: [] }, { status: 200 });
    }

    const searchTerm = query.trim();
    const cacheKey = `user-search:${schoolId}:${searchTerm}`;

    // Check cache first
    const cachedResults = memoryCache.get(cacheKey);
    if (cachedResults) {
      return NextResponse.json({ users: cachedResults }, { status: 200 });
    }

    // Search users by email or full_name with optimized query
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, role, phone, status, created_at, profile_picture_url')
      .eq('school_id', schoolId)
      .or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
      .order('full_name', { ascending: true })
      .limit(50);

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }

    const results = users || [];

    // Cache results for 2 minutes
    memoryCache.set(cacheKey, results, CACHE_CONFIG.MEDIUM);

    // Set HTTP cache headers
    const response = NextResponse.json({ users: results }, { status: 200 });
    response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');
    return response;
  } catch (error) {
    console.error('Search endpoint error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
