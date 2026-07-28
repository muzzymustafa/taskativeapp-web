import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Locale-aware Link/router. Plain <a href="/timeline"> drops the active locale
// because localePrefix is 'as-needed' — /tr/dashboard would navigate to the
// English /timeline. These wrappers keep the prefix.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
