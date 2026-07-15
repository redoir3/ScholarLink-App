'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  ChevronRight,
  Loader2,
  Network,
  Shield,
  Sparkles,
  Upload,
  Users,
  FileSpreadsheet,
  Link2,
  Keyboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import ScholarshipCard from '@/components/ScholarshipCard';
import PageHero from '@/components/PageHero';
import RequireAuth from '@/components/RequireAuth';
import { createSupabaseClient } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/auth-context';
import {
  matchNetworkToScholarships,
  parseLinkedInConnectionsCsv,
  parseManualNetworkInput,
  type NetworkEntity,
  type NetworkMatch,
} from '@/lib/networkMatch';
import { cn } from '@/lib/utils';

function LinkedInMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.23 0z" />
    </svg>
  );
}

function NetworkInner() {
  const { user } = useAuth();
  const [linkedInConnected, setLinkedInConnected] = useState(false);
  const [entities, setEntities] = useState<NetworkEntity[]>([]);
  const [manualText, setManualText] = useState('');
  const [csvName, setCsvName] = useState<string | null>(null);
  const [matches, setMatches] = useState<NetworkMatch[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(1);

  const entitySummary = useMemo(() => {
    const companies = new Set(entities.map((e) => e.company).filter(Boolean) as string[]);
    return { people: entities.length, companies: companies.size };
  }, [entities]);

  const connectLinkedIn = async () => {
    setOauthLoading(true);
    setError(null);
    setInfo(null);
    try {
      const supabase = createSupabaseClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}/network`,
          scopes: 'openid profile email',
        },
      });
      if (oauthError) {
        setInfo(
          'LinkedIn OAuth is not configured in Supabase yet. Complete Step 2 (CSV export) or Step 3 (type orgs) — those work today and are the best way to match scholarships.'
        );
        setLinkedInConnected(true);
        setActiveStep(2);
      }
    } catch {
      setInfo(
        'Use Step 2 or 3 below. LinkedIn does not give apps your full connection list — the CSV export is the official path.'
      );
      setLinkedInConnected(true);
      setActiveStep(2);
    } finally {
      setOauthLoading(false);
    }
  };

  const onCsv = async (file: File | null) => {
    if (!file) return;
    setError(null);
    setCsvName(file.name);
    const text = await file.text();
    const parsed = parseLinkedInConnectionsCsv(text);
    if (!parsed.length) {
      setError(
        'Could not read that file. Use LinkedIn → Settings → Data privacy → Get a copy of your data → Connections (Connections.csv).'
      );
      return;
    }
    setEntities((prev) => {
      const key = (e: NetworkEntity) => `${e.name}|${e.company || ''}`.toLowerCase();
      const map = new Map(prev.map((e) => [key(e), e]));
      parsed.forEach((e) => map.set(key(e), e));
      return [...map.values()];
    });
    setInfo(`Loaded ${parsed.length} connections from ${file.name}. Continue to Step 4 to scan.`);
    setActiveStep(4);
  };

  const addManual = () => {
    const parsed = parseManualNetworkInput(manualText);
    if (!parsed.length) {
      setError('Add at least one company or person (one per line).');
      return;
    }
    setEntities((prev) => {
      const key = (e: NetworkEntity) => `${e.name}|${e.company || ''}`.toLowerCase();
      const map = new Map(prev.map((e) => [key(e), e]));
      parsed.forEach((e) => map.set(key(e), e));
      return [...map.values()];
    });
    setManualText('');
    setError(null);
    setInfo(`Added ${parsed.length} network entries. Continue to Step 4.`);
    setActiveStep(4);
  };

  const runMatch = useCallback(async () => {
    if (!entities.length) {
      setError('Complete Step 2 or 3 first so we have people/orgs to match.');
      return;
    }
    setLoading(true);
    setError(null);
    setMatches(null);
    try {
      const supabase = createSupabaseClient();
      const { data, error: dbError } = await supabase.from('scholarships').select('*').limit(200);
      if (dbError) throw new Error(dbError.message);
      const results = matchNetworkToScholarships(entities, data || []);
      setMatches(results);
      setInfo(
        results.length
          ? `Found ${results.length} scholarship(s) connected to your network.`
          : 'No strong network overlaps yet. Add more company names or grow awards in your city.'
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Match failed');
    } finally {
      setLoading(false);
    }
  }, [entities]);

  const steps = [
    { n: 1, title: 'Optional: LinkedIn identity', icon: Link2 },
    { n: 2, title: 'Upload Connections CSV', icon: FileSpreadsheet },
    { n: 3, title: 'Or type network orgs', icon: Keyboard },
    { n: 4, title: 'Scan scholarships', icon: Sparkles },
  ];

  return (
    <div className="space-y-12">
      <PageHero
        badge="Sign-in required · Your data stays private"
        title="Find scholarships in your network"
        subtitle={`Signed in as ${user?.email}. Connect LinkedIn the clear way: optional OAuth for identity, then upload your official Connections export or type organizations you know.`}
        imageSrc="/images/network-hero.jpg"
        imageAlt="Network connections"
      />

      {/* Step roadmap */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s) => (
          <button
            key={s.n}
            type="button"
            onClick={() => setActiveStep(s.n)}
            className={cn(
              'flex items-center gap-3 rounded-2xl border px-4 py-4 text-left transition',
              activeStep === s.n
                ? 'border-primary bg-blue-50 shadow-sm'
                : 'border-blue-100 bg-white hover:bg-slate-50'
            )}
          >
            <span
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-xl',
                activeStep === s.n ? 'bg-primary text-white' : 'bg-slate-100 text-gray-700'
              )}
            >
              <s.icon className="size-5" />
            </span>
            <span>
              <span className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
                Step {s.n}
              </span>
              <span className="block text-sm font-semibold text-gray-900">{s.title}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="space-y-8 lg:col-span-3">
          {/* Step 1 */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-0 shadow-lg ring-1 ring-blue-100">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-2 text-xl text-gray-900">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-[#0A66C2] text-sm font-bold text-white">
                    1
                  </span>
                  <LinkedInMark className="size-5 text-[#0A66C2]" />
                  Optional: Connect LinkedIn identity
                </CardTitle>
                <CardDescription className="text-gray-700 leading-relaxed">
                  LinkedIn only shares basic profile (name/email) with apps — not your full
                  connection list. This step is optional identity only. For matching, use Step 2 or
                  3.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button
                  onClick={() => void connectLinkedIn()}
                  disabled={oauthLoading}
                  className="rounded-xl bg-[#0A66C2] hover:bg-[#004182]"
                >
                  {oauthLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <LinkedInMark className="size-4" />
                  )}
                  {linkedInConnected ? 'LinkedIn step marked done' : 'Connect LinkedIn profile'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => {
                    setActiveStep(2);
                    setInfo('Skipped OAuth — go to Step 2 (recommended).');
                  }}
                >
                  Skip to CSV upload
                  <ChevronRight className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-xl"
                  onClick={() => setActiveStep(3)}
                >
                  Skip to type orgs
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Step 2 */}
          <Card className="border-0 shadow-lg ring-1 ring-blue-100">
            <CardHeader className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-xl text-gray-900">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
                  2
                </span>
                <Upload className="size-5 text-primary" />
                Upload LinkedIn Connections CSV (recommended)
              </CardTitle>
              <CardDescription className="space-y-2 text-gray-700 leading-relaxed">
                <span className="block font-medium text-gray-900">How to get the file:</span>
                <ol className="list-decimal space-y-1.5 pl-5">
                  <li>Open LinkedIn in a browser → Me → Settings & Privacy</li>
                  <li>Data privacy → Get a copy of your data</li>
                  <li>Select <strong>Connections</strong> only → Request archive</li>
                  <li>Download when ready → open the ZIP → choose <strong>Connections.csv</strong></li>
                  <li>Upload that file below</li>
                </ol>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <a
                href="https://www.linkedin.com/mypreferences/d/download-my-data"
                target="_blank"
                rel="noreferrer"
                className="inline-flex"
              >
                <Button type="button" variant="outline" className="rounded-xl">
                  <LinkedInMark className="size-4 text-[#0A66C2]" />
                  Open LinkedIn data download
                  <ChevronRight className="size-4" />
                </Button>
              </a>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/60 px-6 py-12 transition hover:border-primary hover:bg-blue-50">
                <Upload className="mb-3 size-8 text-primary" />
                <span className="text-center text-sm font-medium text-gray-900">
                  {csvName || 'Drop Connections.csv here or click to browse'}
                </span>
                <span className="mt-1 text-xs text-gray-600">Parsed only in your browser</span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => void onCsv(e.target.files?.[0] || null)}
                />
              </label>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card className="border-0 shadow-lg ring-1 ring-blue-100">
            <CardHeader className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-xl text-gray-900">
                <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
                  3
                </span>
                <Network className="size-5 text-emerald-600" />
                Or type people & organizations
              </CardTitle>
              <CardDescription className="text-gray-700 leading-relaxed">
                One per line. Examples:{' '}
                <code className="rounded bg-slate-100 px-1">Philadelphia Rotary Club</code>,{' '}
                <code className="rounded bg-slate-100 px-1">Jane Smith @ VFW Post 123</code>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label htmlFor="manual">Network entries</Label>
              <textarea
                id="manual"
                rows={5}
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder={`Philadelphia Rotary Club\nJane Smith @ VFW Post 123\nMontgomery County Bar Association`}
                className="w-full rounded-xl border border-input bg-white px-3 py-3 text-sm text-gray-900 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
              <Button type="button" variant="outline" onClick={addManual} className="rounded-xl">
                Add to network list
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar step 4 */}
        <div className="space-y-8 lg:col-span-2">
          <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-emerald-100">
            <div
              className="h-44 w-full shrink-0 bg-cover bg-center sm:h-52"
              style={{ backgroundImage: "url('/images/community-handshake.jpg')" }}
              role="img"
              aria-label="Community connection"
            />
            <CardContent className="space-y-5 pt-6">
              <p className="text-sm font-medium leading-relaxed text-gray-800">
                A warm intro from someone who knows the org beats a cold form every time.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-blue-50 p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{entitySummary.people}</div>
                  <div className="text-xs font-medium text-gray-700">People / entries</div>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-700">{entitySummary.companies}</div>
                  <div className="text-xs font-medium text-gray-700">Organizations</div>
                </div>
              </div>

              <div className="rounded-xl border border-blue-100 bg-slate-50 px-3 py-2 text-xs text-gray-700">
                <strong>Step 4:</strong> Scan LocalLink awards against your network.
              </div>

              <Button
                onClick={() => void runMatch()}
                disabled={loading || !entities.length}
                className="w-full rounded-xl bg-gradient-to-r from-primary to-emerald-600 py-6 text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Scanning…
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" /> Find network scholarships
                  </>
                )}
              </Button>

              <button
                type="button"
                className="w-full text-xs text-gray-600 underline"
                onClick={() => {
                  setEntities([]);
                  setMatches(null);
                  setCsvName(null);
                  setInfo(null);
                  setActiveStep(1);
                }}
              >
                Clear network data
              </button>
            </CardContent>
          </Card>

          <div className="flex gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
            <Shield className="size-5 shrink-0 text-amber-700" />
            <p>
              <strong>Privacy:</strong> CSV parsing happens in your browser. We do not sell contact
              lists. See our{' '}
              <Link href="/privacy" className="font-semibold underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      {(error || info) && (
        <div
          className={cn(
            'rounded-2xl border px-5 py-4 text-sm leading-relaxed',
            error
              ? 'border-red-200 bg-red-50 text-red-900'
              : 'border-blue-200 bg-blue-50 text-blue-950'
          )}
        >
          {error || info}
        </div>
      )}

      {matches && (
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {matches.length > 0
                ? `${matches.length} network-linked scholarship${matches.length === 1 ? '' : 's'}`
                : 'No network overlaps yet'}
            </h2>
            <p className="mt-2 text-gray-700">
              Ranked by overlap with people and organizations in your network.
            </p>
          </div>
          <div className="grid gap-8">
            {matches.map((m, i) => (
              <div key={i} className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">
                    Network fit {m.score}%
                  </span>
                  {m.matchedOn.map((x) => (
                    <span
                      key={x}
                      className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-900"
                    >
                      via {x}
                    </span>
                  ))}
                </div>
                <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                  {m.reasons.map((r) => (
                    <li key={r} className="break-words">
                      {r}
                    </li>
                  ))}
                </ul>
                <ScholarshipCard scholarship={m.scholarship as any} accessMode="full" />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function NetworkPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/40">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <RequireAuth
          nextPath="/network"
          title="Sign in to use Network match"
          description="Network scanning is available to signed-in students and members so we can protect privacy and save your progress. Create a free student account in under a minute."
        >
          <NetworkInner />
        </RequireAuth>
      </div>
    </div>
  );
}
