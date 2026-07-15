'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award } from 'lucide-react';
import ScholarshipCard from '@/components/ScholarshipCard';
import PageHero from '@/components/PageHero';
import RequireAuth from '@/components/RequireAuth';
import { Button } from '@/components/ui/button';
import { createSupabaseClient } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/auth-context';

function SavedInner() {
  const { user } = useAuth();
  const [savedScholarships, setSavedScholarships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) return;
      setLoading(true);
      try {
        const supabase = createSupabaseClient();
        const { data, error: dbError } = await supabase
          .from('saved_scholarships')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (dbError) {
          // Fallback to localStorage until SQL migration is applied
          const local = JSON.parse(localStorage.getItem('savedScholarships') || '[]');
          if (!cancelled) {
            setSavedScholarships(local);
            setError(
              'Cloud saves not set up yet (run sql/002_auth_and_saved.sql). Showing local saves on this device.'
            );
          }
        } else {
          const rows = (data || []).map((r: any) => ({
            ...(r.scholarship_data || {}),
            id: r.scholarship_id || r.scholarship_data?.id,
            'Scholarship Name': r.scholarship_name || r.scholarship_data?.['Scholarship Name'],
          }));
          if (!cancelled) {
            setSavedScholarships(rows);
            setError(null);
          }
        }
      } catch {
        const local = JSON.parse(localStorage.getItem('savedScholarships') || '[]');
        if (!cancelled) setSavedScholarships(local);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div className="space-y-10">
      <PageHero
        badge="Your account shortlist"
        title="Saved scholarships"
        subtitle="Awards you’ve bookmarked while signed in. Reach out, build relationships, and track what matters."
        imageSrc="/images/community-handshake.jpg"
      />

      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-gray-700">Loading your saved opportunities…</div>
      ) : savedScholarships.length > 0 ? (
        <div className="space-y-8">
          {savedScholarships.map((sch: any, i: number) => (
            <ScholarshipCard
              key={sch.id || sch['Scholarship Name'] || i}
              scholarship={sch}
              accessMode="full"
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-rose-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-amber-100">
            <Award className="size-10 text-amber-600" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900">No saved scholarships yet</h3>
          <p className="mx-auto mt-3 max-w-md text-gray-700 leading-relaxed">
            Run the matcher or local search, then tap Save — they’ll appear here on any device when
            you’re signed in.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/matcher">
              <Button className="rounded-xl">Find scholarships</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="rounded-xl">
                Home
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SavedScholarships() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/40 via-white to-blue-50/30">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <RequireAuth
          nextPath="/saved"
          title="Sign in to view saved scholarships"
          description="Student accounts keep your shortlist in the cloud so you can return later and reach out to organizers."
        >
          <SavedInner />
        </RequireAuth>
      </div>
    </div>
  );
}
