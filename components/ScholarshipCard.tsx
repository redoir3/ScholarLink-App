'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heart, Mail, ExternalLink, Copy, X, Award, Lock } from 'lucide-react';
import { useSavedScholarships } from '@/hooks/useSavedScholarships';
import type { StudentProfile } from '@/lib/findScholarships';

interface Scholarship {
  id?: string | number;
  ['Scholarship Name']?: string;
  ['Provider/Org']?: string;
  amount?: number | string | null;
  Amount?: string | number | null;
  ['Why Obtainable']?: string;
  ['Why Obtainable / Relationship Angle']?: string;
  ['Eligibility Tags']?: string;
  ['Notes (for Email Builder Personalization)']?: string;
  ['Contact Name / Email / Phone / URL']?: string;
  ['Application Link']?: string;
  contact_email?: string;
  contact_url?: string;
  contact_person?: string;
  match_score?: number;
  [key: string]: unknown;
}

interface Props {
  scholarship: Scholarship;
  studentProfile?: StudentProfile;
  /** demo = hide contacts & outreach; full = everything for signed-in users */
  accessMode?: 'demo' | 'full';
}

export default function ScholarshipCard({
  scholarship,
  studentProfile,
  accessMode = 'full',
}: Props) {
  const demo = accessMode === 'demo';
  const { isSaved, toggleSave, requiresAuth } = useSavedScholarships(scholarship);
  const [showDraft, setShowDraft] = useState(false);
  const [copied, setCopied] = useState(false);

  const name = scholarship['Scholarship Name'] || 'Unnamed Scholarship';
  const provider = scholarship['Provider/Org'] || 'Organization';
  const why =
    scholarship['Why Obtainable'] ||
    scholarship['Why Obtainable / Relationship Angle'] ||
    '';
  const tags = scholarship['Eligibility Tags'] || '';
  const amountDisplay =
    scholarship.amount != null && scholarship.amount !== ''
      ? typeof scholarship.amount === 'number'
        ? `$${scholarship.amount.toLocaleString()}`
        : String(scholarship.amount).startsWith('$')
          ? String(scholarship.amount)
          : `$${scholarship.amount}`
      : scholarship.Amount
        ? String(scholarship.Amount)
        : null;

  const handleContact = () => {
    if (demo) return;
    const contact =
      scholarship.contact_email ||
      scholarship['Contact Name / Email / Phone / URL'] ||
      scholarship.contact_url ||
      '';
    if (!contact) {
      alert('No contact information available yet.');
      return;
    }
    if (contact.includes('@')) {
      window.location.href = `mailto:${contact}?subject=Inquiry about ${name}`;
    } else if (contact.startsWith('http') || contact.startsWith('www')) {
      window.open(contact.startsWith('http') ? contact : 'https://' + contact, '_blank');
    } else {
      alert(`Contact: ${contact}`);
    }
  };

  const generateEmailDraft = (): string => {
    if (!studentProfile?.school) {
      return 'Complete your profile in the matcher for a personalized draft.';
    }
    const contact = scholarship.contact_person || 'Scholarship Coordinator';
    const notes = scholarship['Notes (for Email Builder Personalization)'] || '';
    const excellence = studentProfile.excellence_areas?.length
      ? studentProfile.excellence_areas.join(', ')
      : studentProfile.fieldsOfStudy?.length
        ? studentProfile.fieldsOfStudy.join(', ')
        : 'my academic and community work';
    const location =
      studentProfile.hometown ||
      [studentProfile.city, studentProfile.state].filter(Boolean).join(', ') ||
      'my community';

    const subject = `Interest in the ${name} — student from ${location}`;
    let body = `Dear ${contact},\n\n`;
    body += `My name is ${studentProfile.name || '[Your Name]'}, a student from ${location} attending ${studentProfile.school}. `;
    body += `I was excited to learn about the ${name} because ${why || 'this opportunity'}. `;
    if (notes) body += `${notes} `;
    body += `I have focused on ${excellence}. `;
    body += `I am committed to making the most of this opportunity.\n\n`;
    body += `I would love to introduce myself and learn more about how I can contribute to your organization. Would you be open to a short conversation?\n\n`;
    body += `Thank you for supporting students.\n\nBest regards,\n${studentProfile.name || '[Your Name]'}`;
    return `Subject: ${subject}\n\n${body}`;
  };

  const draft = useMemo(() => generateEmailDraft(), [scholarship, studentProfile, why]);

  const copyDraft = async () => {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition-all hover:shadow-md sm:p-6">
      <div className="min-w-0 flex-1 space-y-4">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="break-words text-xl font-semibold leading-snug text-gray-900 sm:text-2xl">
              {name}
            </h3>
            <p className="mt-1 break-words font-medium text-gray-600">{provider}</p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {amountDisplay && (
              <span className="whitespace-nowrap text-xl font-bold text-emerald-600 sm:text-2xl">
                {amountDisplay}
              </span>
            )}
            {scholarship.match_score != null && scholarship.match_score > 0 && (
              <div className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
                <Award size={16} className="shrink-0" /> {scholarship.match_score}%
              </div>
            )}
            {demo && (
              <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                <Lock size={12} /> Demo
              </div>
            )}
          </div>
        </div>

        {why && (
          <p className="break-words text-sm leading-relaxed text-gray-700 italic">
            &ldquo;{why}&rdquo;
          </p>
        )}

        {tags && (
          <div className="flex flex-wrap gap-2">
            {tags.split(',').map((tag: string, i: number) =>
              tag.trim() ? (
                <span
                  key={i}
                  className="max-w-full break-words rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-100"
                >
                  {tag.trim()}
                </span>
              ) : null
            )}
          </div>
        )}
      </div>

      {demo ? (
        <div className="mt-6 space-y-3 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-slate-50 p-4">
          <p className="flex items-start gap-2 text-sm leading-relaxed text-gray-800">
            <Lock className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>
              <strong className="text-gray-900">Demo preview</strong> — contact details, outreach
              tools, and save-to-account are unlocked when you sign in as a student.
            </span>
          </p>
          <Link href="/login?next=/matcher&intent=full">
            <Button className="w-full rounded-xl">Sign in for full access</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={() => void toggleSave()}
              variant="outline"
              className="min-h-11 flex-1 rounded-xl"
            >
              <Heart className={isSaved ? 'fill-rose-500 text-rose-500' : ''} size={18} />
              {requiresAuth ? 'Sign in to save' : isSaved ? 'Saved' : 'Save for later'}
            </Button>

            <Button
              onClick={() => setShowDraft(!showDraft)}
              className="min-h-11 flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
              disabled={!studentProfile?.school}
            >
              <Mail size={18} />
              Outreach email
            </Button>

            <Button
              onClick={handleContact}
              className="min-h-11 flex-1 rounded-xl bg-blue-600 hover:bg-blue-700"
            >
              Reach out <ExternalLink size={18} />
            </Button>
          </div>

          {(scholarship.contact_person ||
            scholarship['Contact Name / Email / Phone / URL'] ||
            scholarship.contact_email) && (
            <div className="mt-5 break-words rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-gray-800">Contact for relationship-building</p>
              <p className="mt-1 font-medium text-gray-900">
                {scholarship.contact_person ||
                  scholarship['Contact Name / Email / Phone / URL']?.split('/')[0] ||
                  'Organizer'}
              </p>
              {(scholarship.contact_email ||
                scholarship['Contact Name / Email / Phone / URL']?.includes('@')) && (
                <a
                  href={`mailto:${scholarship.contact_email || scholarship['Contact Name / Email / Phone / URL']}?subject=Introduction - Interest in ${name}`}
                  className="mt-3 inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  Email organizer
                </a>
              )}
            </div>
          )}

          {showDraft && (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-semibold text-amber-900">
                  <Mail size={18} /> Personalized outreach
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowDraft(false)}>
                  <X size={18} />
                </Button>
              </div>
              <div className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-amber-100 bg-white p-4 text-sm text-gray-800">
                {draft}
              </div>
              <Button onClick={() => void copyDraft()} className="mt-3 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700">
                <Copy size={18} className="mr-2" /> {copied ? 'Copied!' : 'Copy draft'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
