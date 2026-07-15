'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Submission = {
  id: string;
  organization_id: string;
  title: string;
  amount: number | null;
  deadline: string | null;
  eligibility: {
    location?: string;
    city?: string;
    state?: string;
    county?: string;
    tags?: string;
    application_link?: string;
    description?: string;
  } | null;
  description: string | null;
  contact_person: string | null;
  contact_email: string | null;
  status: string;
  organizations?: {
    id: string;
    name: string;
    website: string;
    contact_email?: string;
  } | null;
};

function mapSubmissionToScholarship(sub: Submission) {
  const elig = sub.eligibility || {};
  const city = elig.city || '';
  const state = (elig.state || '').toUpperCase();
  const tags =
    elig.tags || [elig.location, city, state, elig.county].filter(Boolean).join(', ');
  const contactCombined = [sub.contact_person, sub.contact_email].filter(Boolean).join(' – ');
  const why =
    sub.description ||
    elig.description ||
    `Local award from ${sub.organizations?.name || 'a community organization'}`;

  return {
    'Scholarship Name': sub.title,
    'Provider/Org': sub.organizations?.name || 'Organization',
    city: city || null,
    state: state || null,
    Amount: sub.amount != null ? `$${sub.amount}` : null,
    amount: sub.amount,
    Deadline: sub.deadline,
    deadline: sub.deadline,
    'Eligibility Tags': tags,
    eligibility_tags: tags,
    'Contact Name / Email / Phone / URL': contactCombined,
    contact_person: sub.contact_person,
    contact_email: sub.contact_email,
    contact_url: elig.application_link || sub.organizations?.website || null,
    'Application Link': elig.application_link || sub.organizations?.website || null,
    'Why Obtainable / Relationship Angle': why,
    why_obtainable: why,
    'Notes (for Email Builder Personalization)':
      'Org-submitted listing — mention genuine interest in their local mission.',
    notes_for_email:
      'Org-submitted listing — mention genuine interest in their local mission.',
    'Last Verified Date': new Date().toISOString().slice(0, 10),
    source_url: elig.application_link || sub.organizations?.website || null,
    source_method: 'org_submission',
  };
}

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { user, isAdmin, loading: authLoading, mounted } = useAuth();

  const allowed =
    process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@locallink.app';

  const fetchSubmissions = useCallback(async () => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('scholarship_submissions')
      .select(`*, organizations(*)`)
      .order('created_at', { ascending: false });

    if (error) setMessage('Error: ' + error.message);
    else setSubmissions((data as Submission[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!mounted || authLoading) return;

    if (!user) {
      router.push('/login?next=/admin');
      return;
    }

    const emailOk =
      !allowed || user.email?.toLowerCase() === allowed.toLowerCase() || isAdmin;

    if (!emailOk && !isAdmin) {
      setMessage('Signed in, but this account is not authorized for admin.');
      setLoading(false);
      return;
    }

    void fetchSubmissions();
  }, [mounted, authLoading, user, isAdmin, allowed, router, fetchSubmissions]);

  const handleApprove = async (sub: Submission) => {
    setMessage('Publishing…');
    const supabase = createSupabaseClient();
    const row = mapSubmissionToScholarship(sub);

    const { error: pubError } = await supabase.from('scholarships').insert(row);
    if (pubError) {
      const { error: upError } = await supabase
        .from('scholarships')
        .upsert(row, { onConflict: 'Scholarship Name' });
      if (upError) {
        setMessage('Publish failed: ' + upError.message + ' (submission not marked approved)');
        return;
      }
    }

    await supabase
      .from('scholarship_submissions')
      .update({ status: 'approved' })
      .eq('id', sub.id);

    if (sub.organization_id) {
      await supabase
        .from('organizations')
        .update({ verified: true })
        .eq('id', sub.organization_id);
    }

    setMessage(`✅ Approved and published: ${sub.title}`);
    await fetchSubmissions();
  };

  const handleReject = async (id: string) => {
    const supabase = createSupabaseClient();
    await supabase.from('scholarship_submissions').update({ status: 'rejected' }).eq('id', id);
    setMessage('Rejected.');
    await fetchSubmissions();
  };

  if (!mounted || authLoading || loading) {
    return <div className="p-8 text-center text-gray-600">Loading admin dashboard…</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-violet-50/30 p-6 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-r from-violet-700 via-primary to-blue-600 p-8 text-white shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-100">Internal</p>
              <h1 className="mt-1 text-3xl font-bold">Admin moderation</h1>
              <p className="mt-2 text-sm text-blue-50">
                Review org submissions → publish verified awards only.
                {user?.email ? ` Signed in as ${user.email}.` : ''}
              </p>
            </div>
            <Button
              onClick={() => void fetchSubmissions()}
              variant="secondary"
              className="rounded-xl"
            >
              Refresh
            </Button>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
            {message}
          </div>
        )}

        <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-black/5">
          <CardHeader>
            <CardTitle className="text-lg">Submissions ({submissions.length})</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="p-4 font-semibold">Scholarship</th>
                  <th className="p-4 font-semibold">Organization</th>
                  <th className="p-4 font-semibold">Location</th>
                  <th className="p-4 font-semibold">Contact</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No submissions yet. Orgs use /submit after login.
                    </td>
                  </tr>
                )}
                {submissions.map((sub) => {
                  const loc =
                    sub.eligibility?.location ||
                    [sub.eligibility?.city, sub.eligibility?.state].filter(Boolean).join(', ') ||
                    '—';
                  return (
                    <tr key={sub.id} className="border-t border-border align-top">
                      <td className="p-4">
                        <strong className="text-gray-900">{sub.title}</strong>
                        <div className="text-gray-500">
                          {sub.amount != null ? `$${sub.amount}` : 'Amount TBD'}
                          {sub.deadline ? ` · ${sub.deadline}` : ''}
                        </div>
                      </td>
                      <td className="p-4">
                        {sub.organizations?.name || '—'}
                        <br />
                        {sub.organizations?.website && (
                          <a
                            href={sub.organizations.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline"
                          >
                            Visit site
                          </a>
                        )}
                      </td>
                      <td className="p-4">{loc}</td>
                      <td className="p-4">
                        {sub.contact_person}
                        <br />
                        <span className="text-gray-500">{sub.contact_email}</span>
                      </td>
                      <td className="p-4 font-medium capitalize">{sub.status}</td>
                      <td className="p-4">
                        {sub.status === 'pending' && (
                          <div className="flex flex-col gap-2 sm:flex-row">
                            <Button
                              size="sm"
                              className="rounded-lg bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => void handleApprove(sub)}
                            >
                              Approve & publish
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-lg"
                              onClick={() => void handleReject(sub.id)}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <p className="mt-6 text-xs text-gray-500">
          <Link href="/" className="text-primary underline">
            Home
          </Link>
          {' · '}
          Growth workflow in docs/ethical-data-playbook.md
        </p>
      </div>
    </div>
  );
}
