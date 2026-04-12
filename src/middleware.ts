import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/', '/(tr|de|es|ar|zh)/:path*', '/login', '/dashboard', '/groups', '/groups/:path*', '/privacy', '/terms'],
};
