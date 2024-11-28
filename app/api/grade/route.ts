import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { parseDocument } from '@/lib/llamaparse';

// Cache object to store parsed results
const parseCache = new Map<string, any>();

export async function GET(request: NextRequest) {
  try {
    const fileName = request.nextUrl.searchParams.get('fileName');
    const length = (request.nextUrl.searchParams.get('length') as 'short' | 'medium' | 'long') || 'medium';

    if (!fileName) {
      return NextResponse.json({ error: 'fileName is required' }, { status: 400 });
    }

    // Create a cache key from the fileName and length
    const cacheKey = `${fileName}-${length}`;

    // Check if we have a cached result
    if (parseCache.has(cacheKey)) {
      return NextResponse.json(parseCache.get(cacheKey));
    }

    const filePath = path.join(process.cwd(), 'docs', 'uploaded', fileName);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // If not in cache, parse the content
    const result = await parseDocument(filePath, length);
    
    // Store in cache
    parseCache.set(cacheKey, result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in grade API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
