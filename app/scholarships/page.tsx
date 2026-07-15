import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import ScholarshipCard from '@/components/ScholarshipCard';
import PageHero from '@/components/PageHero';
import { Button } from '@/components/ui/button';

export default async function ScholarshipsPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; state?: string; mode?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const supabase = createClient();

  let query = supabase.from('scholarships').select('*').order('deadline', { ascending: true });

  const isLocalMode =
    resolvedSearchParams.mode === 'local' &&
    resolvedSearchParams.city &&
    resolvedSearchParams.state;

  if (isLocalMode) {
    query = query
      .ilike('city', `%${resolvedSearchParams.city}%`)
      .eq('state', resolvedSearchParams.state)
      .limit(24);
  } else {
    query = query.limit(18);
  }

  const { data: scholarships, error } = await query;

  if (error) {
    console.error('Supabase error:', error);
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          Error loading scholarships: {error.message}
        </div>
        <Link href="/" className="mt-4 inline-block text-primary underline">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/40">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
        <PageHero
          badge={isLocalMode ? 'Local results' : 'Browse'}
          title={
            isLocalMode
              ? `Scholarships near ${resolvedSearchParams.city}`
              : 'Available scholarships'
          }
          subtitle={
            isLocalMode
              ? `Showing opportunities for ${resolvedSearchParams.city}, ${resolvedSearchParams.state}. Reach out to contacts to build relationships.`
              : 'A sample of awards in LocalLink. Use Match Me or city search for better personalization.'
          }
          imageSrc="/images/students-local.jpg"
        >
          <div className="flex flex-wrap gap-3">
            <Link href="/local-search">
              <Button variant="secondary" className="rounded-xl">
                Change location
              </Button>
            </Link>
            <Link href="/matcher">
              <Button className="rounded-xl bg-white text-primary hover:bg-blue-50">
                Personalize matches
              </Button>
            </Link>
          </div>
        </PageHero>

        {isLocalMode && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm text-emerald-900">
            Local mode for <strong>{resolvedSearchParams.city}, {resolvedSearchParams.state}</strong>
          </div>
        )}

        <p className="rounded-2xl border border-slate-200 bg-white/80 px-5 py-3 text-xs leading-relaxed text-slate-600">
          LocalLink is not affiliated with any organization whose scholarship appears here. Listings
          are for informational purposes only — use each card&apos;s official apply link and verify
          details with the sponsor before applying.
        </p>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {scholarships && scholarships.length > 0 ? (
            scholarships.map((scholarship: { id?: string | number; ['Scholarship Name']?: string }) => (
              <ScholarshipCard key={scholarship.id ?? scholarship['Scholarship Name']} scholarship={scholarship as any} />
            ))
          ) : (
            <div className="col-span-full rounded-3xl border border-dashed border-blue-200 bg-white py-16 text-center">
              <p className="text-lg text-gray-600">No matching scholarships found yet.</p>
              <Link href="/matcher" className="mt-4 inline-block text-primary font-medium underline">
                Try the matcher
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
