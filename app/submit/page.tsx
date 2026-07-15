'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RequireAuth from '@/components/RequireAuth';
import { useAuth } from '@/lib/auth-context';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
];

const emptyForm = {
  orgName: '',
  orgWebsite: '',
  orgEmail: '',
  title: '',
  amount: '',
  deadline: '',
  description: '',
  eligibilityTags: '',
  city: '',
  state: '',
  county: '',
  contactPerson: '',
  contactEmail: '',
  applicationLink: '',
};

function SubmitForm() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isValidOrg = () => {
    const site = formData.orgWebsite.trim().toLowerCase();
    return site.startsWith('https://') && formData.orgEmail.includes('@');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.orgName || !isValidOrg() || !formData.contactPerson) {
      setMessage('Please provide org name, https:// website, valid email, and contact person.');
      return;
    }
    if (!formData.title.trim() || !formData.city.trim() || !formData.state) {
      setMessage('Scholarship title, city, and state are required for local matching.');
      return;
    }

    setSubmitting(true);
    setMessage('Submitting for review...');

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .upsert(
        {
          name: formData.orgName.trim(),
          website: formData.orgWebsite.trim(),
          contact_email: formData.orgEmail.trim(),
          verified: false,
        },
        { onConflict: 'name' }
      )
      .select()
      .single();

    // If upsert-on-name fails (no unique constraint), fall back to insert
    let organizationId = org?.id;
    if (orgError || !organizationId) {
      const ins = await supabase
        .from('organizations')
        .insert({
          name: formData.orgName.trim(),
          website: formData.orgWebsite.trim(),
          contact_email: formData.orgEmail.trim(),
          verified: false,
        })
        .select()
        .single();
      if (ins.error) {
        setMessage('Error saving organization: ' + ins.error.message);
        setSubmitting(false);
        return;
      }
      organizationId = ins.data.id;
    }

    const locationLabel = [formData.city.trim(), formData.county.trim() || null, formData.state]
      .filter(Boolean)
      .join(', ');

    const { error } = await supabase.from('scholarship_submissions').insert({
      organization_id: organizationId,
      title: formData.title.trim(),
      amount: formData.amount ? parseFloat(formData.amount) : null,
      deadline: formData.deadline || null,
      eligibility: {
        location: locationLabel,
        city: formData.city.trim(),
        state: formData.state,
        county: formData.county.trim() || null,
        tags: formData.eligibilityTags.trim() || null,
        application_link: formData.applicationLink.trim() || null,
        description: formData.description.trim() || null,
      },
      description: formData.description.trim(),
      contact_person: formData.contactPerson.trim(),
      contact_email: formData.contactEmail.trim() || formData.orgEmail.trim(),
      submitted_by: user.id,
      status: 'pending',
    });

    setSubmitting(false);

    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage(
        '✅ Submission received. Our team will verify it against your organization before it goes live — no automated scraping, human review only.'
      );
      setFormData(emptyForm);
      setStep(1);
    }
  };

  const resetForm = () => {
    setMessage('');
    setFormData(emptyForm);
    setStep(1);
  };

  return (
    <div className="space-y-8">
        <div className="rounded-3xl border border-emerald-100 bg-gradient-to-r from-primary via-blue-700 to-emerald-700 p-8 text-white shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/90">Organizations</p>
          <h1 className="mt-2 text-3xl font-bold text-white">List a local scholarship</h1>
          <p className="mt-3 text-base font-medium leading-relaxed text-white">
            Signed in as {user?.email}. Free listing — human review before publish.
          </p>
        </div>

        <Card className="border-0 shadow-xl ring-1 ring-blue-100">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Submission form</CardTitle>
            <CardDescription className="text-base text-gray-600">
              Accurate city & state help students nearby find your award.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {message && (
              <div
                className={`mb-6 rounded-2xl p-4 text-center text-sm ${
                  message.includes('✅')
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-amber-50 text-amber-900 border border-amber-200'
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">Step 1: Organization</h2>
                  <div className="space-y-2">
                    <Label htmlFor="orgName">Organization name *</Label>
                    <Input
                      id="orgName"
                      name="orgName"
                      placeholder="e.g. VFW Post 1234 Auxiliary"
                      value={formData.orgName}
                      onChange={handleChange}
                      required
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgWebsite">Official website (https://) *</Label>
                    <Input
                      id="orgWebsite"
                      name="orgWebsite"
                      type="url"
                      placeholder="https://…"
                      value={formData.orgWebsite}
                      onChange={handleChange}
                      required
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgEmail">Organization email *</Label>
                    <Input
                      id="orgEmail"
                      name="orgEmail"
                      type="email"
                      placeholder="scholarships@yourorg.org"
                      value={formData.orgEmail}
                      onChange={handleChange}
                      required
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <Button type="button" onClick={() => setStep(2)} className="w-full rounded-xl">
                    Next →
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">Step 2: Award details</h2>
                  <div className="space-y-2">
                    <Label htmlFor="title">Scholarship title *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="city">City / town served *</Label>
                      <Input
                        id="city"
                        name="city"
                        placeholder="Primary city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <select
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        className="h-11 w-full rounded-xl border border-input bg-input/30 px-3 text-sm"
                      >
                        <option value="">Select state</option>
                        {US_STATES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="county">County (optional)</Label>
                    <Input
                      id="county"
                      name="county"
                      value={formData.county}
                      onChange={handleChange}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (USD, optional)</Label>
                      <Input
                        id="amount"
                        name="amount"
                        type="number"
                        value={formData.amount}
                        onChange={handleChange}
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deadline">Deadline (optional)</Label>
                      <Input
                        id="deadline"
                        name="deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={handleChange}
                        className="h-11 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eligibilityTags">Eligibility tags</Label>
                    <Input
                      id="eligibilityTags"
                      name="eligibilityTags"
                      placeholder="e.g. High School Senior, Local resident, Military family"
                      value={formData.eligibilityTags}
                      onChange={handleChange}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description / full eligibility</Label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-input bg-input/30 px-3 py-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      placeholder="Who can apply, GPA, residency, required essays, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="applicationLink">Application link (optional)</Label>
                    <Input
                      id="applicationLink"
                      name="applicationLink"
                      type="url"
                      placeholder="https://…"
                      value={formData.applicationLink}
                      onChange={handleChange}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact person *</Label>
                    <Input
                      id="contactPerson"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleChange}
                      required
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact email *</Label>
                    <Input
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      required
                      className="h-11 rounded-xl"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1 rounded-xl"
                    >
                      ← Back
                    </Button>
                    <Button type="submit" disabled={submitting} className="flex-1 rounded-xl">
                      {submitting ? 'Submitting…' : 'Submit for review'}
                    </Button>
                  </div>
                </div>
              )}
            </form>

            {message.includes('✅') && (
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="mt-6 w-full rounded-xl"
              >
                Submit another scholarship
              </Button>
            )}
          </CardContent>
        </Card>
    </div>
  );
}

export default function SubmitScholarship() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30 px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <RequireAuth
          nextPath="/submit"
          allowRoles={['organization', 'admin', 'student']}
          title="Organization sign-in required"
          description="Sign in securely before listing a scholarship. Create an Organization account (or sign in) — submissions are reviewed before going live."
        >
          <SubmitForm />
        </RequireAuth>
      </div>
    </div>
  );
}
