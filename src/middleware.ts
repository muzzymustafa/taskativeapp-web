import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intl = createMiddleware(routing);

const WINDOW_MS = 60_000;
const MAX_PER_MIN = 120;
const MAX_BUCKETS = 10_000;

type Bucket = { start: number; count: number };
const ipBuckets = new Map<string, Bucket>();

function ipOf(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

function throttle(ip: string, now: number): { ok: boolean; retryAfter: number } {
  const bucket = ipBuckets.get(ip);
  if (!bucket || now - bucket.start > WINDOW_MS) {
    ipBuckets.set(ip, { start: now, count: 1 });
    if (ipBuckets.size > MAX_BUCKETS) {
      for (const [k, v] of ipBuckets) {
        if (now - v.start > WINDOW_MS * 2) ipBuckets.delete(k);
      }
    }
    return { ok: true, retryAfter: 0 };
  }
  if (bucket.count >= MAX_PER_MIN) {
    return {
      ok: false,
      retryAfter: Math.max(1, Math.ceil((WINDOW_MS - (now - bucket.start)) / 1000)),
    };
  }
  bucket.count++;
  return { ok: true, retryAfter: 0 };
}

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/api/')) {
    const res = throttle(ipOf(req), Date.now());
    if (!res.ok) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(res.retryAfter),
          },
        }
      );
    }
    return NextResponse.next();
  }

  return intl(req);
}

export const config = {
  matcher: [
    '/',
    '/(tr|de|es|ar|zh)/:path*',
    '/login',
    '/dashboard',
    '/groups',
    '/groups/:path*',
    '/reports',
    '/calendar',
    '/timeline',
    '/privacy',
    '/terms',
    '/guide',
    '/one-pager',
    '/api/:path*',
  ],
};
