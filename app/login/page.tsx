'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, GraduationCap, Shield } from 'lucide-react';
import { createSupabaseClient } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type AccountType = 'student' | 'organization' | 'admin';

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '';
  const intent = searchParams.get('intent') || '';
  const modeParam = searchParams.get('mode');

  const [accountType, setAccountType] = useState<AccountType>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(modeParam === 'signup');
  const router = useRouter();
  const { isAuthenticated, isAdmin, refresh } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;
    if (next) {
      router.push(next);
      return;
    }
    if (isAdmin) router.push('/admin');
    else if (accountType === 'organization') router.push('/submit');
    else router.push('/saved');
  }, [isAuthenticated, isAdmin, next, router, accountType]);

  const redirectAfterAuth = () => {
    if (next) {
      router.push(next);
      return;
    }
    if (accountType === 'admin') router.push('/admin');
    else if (accountType === 'organization') router.push('/submit');
    else router.push(intent === 'full' ? '/matcher' : '/saved');
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage('Please enter email and password');
      return;
    }
    setIsLoading(true);
    setMessage('');
    const supabase = createSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage('Login failed: ' + error.message);
      setIsLoading(false);
      return;
    }
    await refresh();
    setIsLoading(false);
    redirectAfterAuth();
  };

  const handleSignup = async () => {
    if (accountType === 'admin') {
      setMessage('Admin accounts are provisioned separately. Use the admin credentials to sign in.');
      return;
    }
    if (!email || password.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }
    setIsLoading(true);
    setMessage('');
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + (next || '/saved'),
        data: {
          role: accountType,
          full_name: fullName || email.split('@')[0],
        },
      },
    });
    if (error) {
      setMessage('Signup failed: ' + error.message);
      setIsLoading(false);
      return;
    }
    // Ensure profile row if table exists
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email,
        full_name: fullName || email.split('@')[0],
        role: accountType,
      });
    }
    setMessage(
      data.session
        ? 'Account created! Redirecting…'
        : 'Signup successful! Check your email to confirm, then sign in.'
    );
    setIsLoading(false);
    if (data.session) {
      await refresh();
      redirectAfterAuth();
    }
  };

  const tabs: { id: AccountType; label: string; icon: typeof GraduationCap; hint: string }[] = [
    { id: 'student', label: 'Student', icon: GraduationCap, hint: 'Save awards & full matcher' },
    { id: 'organization', label: 'Organization', icon: Building2, hint: 'List scholarships' },
    { id: 'admin', label: 'Admin', icon: Shield, hint: 'Quick staff access' },
  ];

  return (
    <div className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center overflow-hidden px-4 py-12">
      {/* Background uses CSS so we avoid fill height-0 warnings */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25"
        style={{ backgroundImage: "url('/images/network-hero.jpg')" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white/95 to-emerald-50" aria-hidden />

      <Card className="relative z-10 w-full max-w-md border-0 shadow-2xl ring-1 ring-blue-100">
        <CardHeader className="space-y-4 text-center">
          <Link href="/" className="mx-auto flex items-center justify-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-500 text-sm font-bold text-white">
              LS
            </div>
            <span className="text-2xl font-semibold text-gray-900">LocalLink</span>
          </Link>
          <div>
            <CardTitle className="text-2xl text-gray-900">
              {isSignup ? 'Create your account' : 'Sign in securely'}
            </CardTitle>
            <CardDescription className="mt-2 text-gray-700">
              {intent === 'save' && 'Sign in as a student to save scholarships to your account. '}
              {intent === 'full' && 'Sign in for full matcher access (contacts & outreach). '}
              Choose student, organization, or admin.
            </CardDescription>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setAccountType(t.id);
                  if (t.id === 'admin') setIsSignup(false);
                }}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-center transition',
                  accountType === t.id
                    ? 'border-primary bg-blue-50 text-primary shadow-sm'
                    : 'border-border bg-white text-gray-700 hover:bg-slate-50'
                )}
              >
                <t.icon className="size-5 shrink-0" />
                <span className="text-xs font-semibold">{t.label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-600">{tabs.find((t) => t.id === accountType)?.hint}</p>
        </CardHeader>

        <CardContent className="space-y-4">
          {isSignup && accountType !== 'admin' && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className="h-11 rounded-xl"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder={
                accountType === 'organization' ? 'you@yourorg.org' : 'you@school.edu'
              }
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>

          {accountType === 'organization' && (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs leading-relaxed text-emerald-900">
              Organizations must sign in before listing a scholarship. Listings are reviewed before
              going live.
            </p>
          )}
          {accountType === 'admin' && (
            <p className="rounded-xl bg-violet-50 px-3 py-2 text-xs leading-relaxed text-violet-900">
              Use the dedicated admin email/password from your seed script. Not for public signup.
            </p>
          )}

          {!isSignup || accountType === 'admin' ? (
            <Button
              onClick={() => void handleLogin()}
              disabled={isLoading}
              className="h-11 w-full rounded-xl"
            >
              {isLoading ? 'Signing in…' : 'Sign in'}
            </Button>
          ) : (
            <Button
              onClick={() => void handleSignup()}
              disabled={isLoading}
              className="h-11 w-full rounded-xl"
            >
              {isLoading ? 'Creating…' : 'Create account'}
            </Button>
          )}

          {accountType !== 'admin' && (
            <button
              type="button"
              className="w-full text-sm font-medium text-primary hover:underline"
              onClick={() => {
                setIsSignup((v) => !v);
                setMessage('');
              }}
            >
              {isSignup ? 'Already have an account? Sign in' : 'Need an account? Sign up free'}
            </button>
          )}

          {message && (
            <p className="break-words rounded-xl bg-blue-50 px-3 py-2 text-center text-sm text-blue-950">
              {message}
            </p>
          )}

          <p className="text-center text-xs text-gray-600">
            <Link href="/privacy" className="underline hover:text-primary">
              Privacy
            </Link>
            {' · '}
            <Link href="/terms" className="underline hover:text-primary">
              Terms
            </Link>
            {' · '}
            <Link href="/" className="underline hover:text-primary">
              Home
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-gray-600">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
