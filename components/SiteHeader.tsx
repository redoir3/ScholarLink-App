'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/matcher', label: 'Match Me' },
  { href: '/local-search', label: 'Discover' },
  { href: '/network', label: 'Network' },
  { href: '/saved', label: 'Saved' },
  { href: '/manifesto', label: 'Manifesto' },
  { href: '/submit', label: 'For Orgs' },
];

/**
 * Auth chrome is identical on server + first client paint (always "Sign in").
 * After mount, we swap to signed-in controls. That avoids hydration mismatches.
 */
export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const { user, role, isAuthenticated, isAdmin, signOut, loading } = useAuth();

  useEffect(() => {
    setReady(true);
  }, []);

  // Until client is ready (and auth finished loading), render the guest chrome
  const showSignedIn = ready && !loading && isAuthenticated;
  const showAdmin = ready && !loading && isAdmin;

  return (
    <header className="sticky top-0 z-50 border-b border-blue-100/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-500 text-sm font-bold text-white shadow-sm">
            LS
          </div>
          <span className="text-xl font-semibold tracking-tight text-gray-900">
            Local<span className="text-primary">Link</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-2 xl:flex" aria-label="Main">
          {NAV.map((item) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-full px-4 py-2.5 text-sm font-medium transition',
                  active
                    ? 'bg-blue-50 text-primary'
                    : 'text-gray-700 hover:bg-slate-50 hover:text-primary'
                )}
              >
                {item.label}
              </Link>
            );
          })}
          {showAdmin && (
            <Link
              href="/admin"
              className={cn(
                'rounded-full px-4 py-2.5 text-sm font-medium',
                pathname.startsWith('/admin')
                  ? 'bg-violet-100 text-violet-800'
                  : 'text-violet-700 hover:bg-violet-50'
              )}
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {/* Same structure SSR + hydrate: Sign in OR signed-in block only after ready */}
          {showSignedIn ? (
            <div className="hidden items-center gap-3 sm:flex">
              <span className="max-w-[160px] truncate text-xs font-medium text-gray-600">
                {user?.email}
                {role ? ` · ${role}` : ''}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => void signOut()}
              >
                <LogOut className="size-3.5" /> Sign out
              </Button>
            </div>
          ) : (
            <Link href="/login" className="hidden sm:block">
              <Button variant="outline" size="sm" className="rounded-full border-blue-200">
                Sign in
              </Button>
            </Link>
          )}

          <Link href="/matcher" className="hidden md:block">
            <Button size="sm" className="rounded-full bg-gradient-to-r from-primary to-blue-600">
              Get matched
            </Button>
          </Link>

          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-xl border border-border xl:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-blue-50 bg-white px-4 py-4 xl:hidden">
          <div className="flex flex-col gap-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'rounded-xl px-4 py-3 text-sm font-medium',
                  pathname === item.href
                    ? 'bg-blue-50 text-primary'
                    : 'text-gray-800 hover:bg-slate-50'
                )}
              >
                {item.label}
              </Link>
            ))}
            {showAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-violet-800"
              >
                Admin
              </Link>
            )}
            {showSignedIn ? (
              <Button
                variant="outline"
                className="mt-2 w-full rounded-xl"
                onClick={() => {
                  setOpen(false);
                  void signOut();
                }}
              >
                Sign out
              </Button>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)} className="mt-2">
                <Button variant="outline" className="w-full rounded-xl">
                  Sign in
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
