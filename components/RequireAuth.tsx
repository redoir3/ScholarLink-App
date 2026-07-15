'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth, type UserRole } from '@/lib/auth-context';

type Props = {
  children: React.ReactNode;
  /** If set, only these roles may proceed */
  allowRoles?: UserRole[];
  title?: string;
  description?: string;
  nextPath?: string;
};

export default function RequireAuth({
  children,
  allowRoles,
  title = 'Sign in to continue',
  description = 'Create a free account or sign in to unlock this feature.',
  nextPath,
}: Props) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-600">
        Checking your session…
      </div>
    );
  }

  if (!user) {
    const signInQs = new URLSearchParams();
    const signUpQs = new URLSearchParams();
    if (nextPath) {
      signInQs.set('next', nextPath);
      signUpQs.set('next', nextPath);
    }
    signUpQs.set('mode', 'signup');
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-lg rounded-3xl border border-blue-100 bg-white p-8 text-center shadow-xl sm:p-10"
      >
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-primary">
          <Lock className="size-7" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="mt-3 leading-relaxed text-gray-700">{description}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href={`/login?${signInQs.toString()}`}>
            <Button className="w-full rounded-xl sm:w-auto">
              <LogIn className="size-4" /> Sign in
            </Button>
          </Link>
          <Link href={`/login?${signUpQs.toString()}`}>
            <Button variant="outline" className="w-full rounded-xl sm:w-auto">
              Create free account
            </Button>
          </Link>
        </div>
        <p className="mt-6 text-xs text-gray-600">
          By continuing you agree to our{' '}
          <Link href="/terms" className="text-primary underline">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-primary underline">
            Privacy Policy
          </Link>
          .
        </p>
      </motion.div>
    );
  }

  if (allowRoles && role && !allowRoles.includes(role) && role !== 'admin') {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-amber-100 bg-amber-50 p-8 text-center">
        <h2 className="text-xl font-bold text-amber-950">Wrong account type</h2>
        <p className="mt-2 text-amber-900/80">
          This area is for {allowRoles.filter(Boolean).join(' / ')} accounts. You are signed in as{' '}
          <strong>{role}</strong>.
        </p>
        <Link href="/" className="mt-6 inline-block text-primary underline">
          Back to home
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
