'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Mail, ExternalLink, Copy, X, Award } from 'lucide-react';
import { useSavedScholarships } from '@/hooks/useSavedScholarships';

interface Scholarship {
  id: string;
  ["Scholarship Name"]?: string;
  ["Provider/Org"]?: string;
  amount?: number;
  ["Why Obtainable"]?: string;
  ["Eligibility Tags"]?: string;
  ["Notes (for Email Builder Personalization)"]?: string;
  ["Contact Name / Email / Phone / URL"]?: string;
  contact_email?: string;
  contact_url?: string;
  contact_person?: string;
  match_score?: number;
}

interface StudentProfile {
  school: string;
  hometown: string;
  excellence_areas: string[];
  military?: boolean;
  first_gen?: boolean;
  pell?: boolean;
  name?: string;
  year?: string;
}

interface Props {
  scholarship: Scholarship;
  studentProfile?: StudentProfile;
}

export default function ScholarshipCard({ scholarship, studentProfile }: Props) {
  const { isSaved, toggleSave } = useSavedScholarships(scholarship);
  const [showDraft, setShowDraft] = useState(false);
  const [copied, setCopied] = useState(false);

  const name = scholarship["Scholarship Name"] || "Unnamed Scholarship";
  const provider = scholarship["Provider/Org"] || "Organization";

  const handleContact = () => {
    let contact = scholarship.contact_email || scholarship["Contact Name / Email / Phone / URL"] || scholarship.contact_url || '';
    if (!contact) {
      alert("No contact information available yet.\n\nWe're adding direct contacts to help build relationships!");
      return;
    }
    if (contact.includes('@')) {
      window.location.href = `mailto:${contact}?subject=Inquiry about ${name}`;
    } else if (contact.startsWith('http') || contact.startsWith('www')) {
      window.open(contact.startsWith('http') ? contact : 'https://' + contact, '_blank');
    } else {
      alert(`Contact: ${contact}\n\nReach out to build a real connection!`);
    }
  };

  const generateEmailDraft = (): string => {
    if (!studentProfile?.school) {
      return "Complete your profile above for a personalized draft.";
    }

    const contact = scholarship.contact_person || 'Scholarship Coordinator';
    const why = scholarship["Why Obtainable"] || 'this opportunity';
    const notes = scholarship["Notes (for Email Builder Personalization)"] || '';
    const excellence = studentProfile.excellence_areas?.length ? studentProfile.excellence_areas.join(', ') : 'your achievements';

    const subject = `Interested in the ${name} from a ${studentProfile.hometown} Student`;

    let body = `Dear ${contact},\n\n`;
    body += `My name is ${studentProfile.name || 'a motivated student'} from ${studentProfile.hometown}, currently attending ${studentProfile.school}. `;
    body += `I was excited to learn about the ${name} because ${why}. `;
    if (notes) body += `${notes} `;
    body += `I have excelled in ${excellence}. `;
    if (studentProfile.military) body += `As someone with a military background, `;
    if (studentProfile.first_gen) body += `as a first-generation college student, `;
    if (studentProfile.pell) body += `and as a Pell Grant recipient, `;
    body += `I am committed to making the most of this opportunity.\n\n`;
    body += `I would love to introduce myself and learn more about how I can contribute to your organization. Would you be open to a short conversation?\n\n`;
    body += `Thank you for supporting students!\n\nBest regards,\n${studentProfile.name || 'Your Name'}`;

    return `Subject: ${subject}\n\n${body}`;
  };

  const draft = useMemo(() => generateEmailDraft(), [scholarship, studentProfile]);

  const copyDraft = async () => {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
      <div className="flex-1">
        {/* Header, amount, why, tags - unchanged from your version */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">{name}</h3>
            <p className="text-gray-600 font-medium">{provider}</p>
          </div>
          <div className="flex items-center gap-2">
            {scholarship.amount && <span className="text-3xl font-bold text-emerald-600">${scholarship.amount.toLocaleString()}</span>}
            {scholarship.match_score && (
              <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1 rounded-2xl text-sm font-medium">
                <Award size={16} /> {scholarship.match_score}%
              </div>
            )}
          </div>
        </div>

        {scholarship["Why Obtainable"] && <p className="text-gray-600 text-sm line-clamp-3 mb-4 italic">"{scholarship["Why Obtainable"]}"</p>}

        {scholarship["Eligibility Tags"] && (
          <div className="flex flex-wrap gap-2 mb-6">
            {scholarship["Eligibility Tags"].split(',').map((tag: string, i: number) => (
              <span key={i} className="px-3 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-2xl">
                {tag.trim()}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Button onClick={toggleSave} variant="outline" className="flex-1 flex items-center justify-center gap-2">
          <Heart className={isSaved ? 'fill-rose-500 text-rose-500' : ''} size={18} />
          {isSaved ? 'Saved ❤️' : 'Save for Later'}
        </Button>

        <Button onClick={() => setShowDraft(!showDraft)} className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white flex items-center justify-center gap-2" disabled={!studentProfile?.school}>
          <Mail size={18} />
          Generate Outreach Email
        </Button>

        <Button onClick={handleContact} className="flex-1 bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2">
          Reach Out to Organizer <ExternalLink size={18} />
        </Button>
      </div>

      {/* Contact Section */}
      {(scholarship.contact_person || scholarship["Contact Name / Email / Phone / URL"]) && (
        <div className="mt-6 pt-6 border-t border-gray-200 bg-blue-50 rounded-xl p-4">
          <p className="text-sm font-semibold text-gray-700 mb-1">💬 Contact to Build Relationship:</p>
          <p className="font-medium text-gray-900 mb-3">
            {scholarship.contact_person || scholarship["Contact Name / Email / Phone / URL"]?.split('/')[0] || 'Organizer'}
          </p>
          {(scholarship.contact_email || scholarship["Contact Name / Email / Phone / URL"]?.includes('@')) && (
            <a href={`mailto:${scholarship.contact_email || scholarship["Contact Name / Email / Phone / URL"]}?subject=Introduction - Interest in ${name}`} className="inline-flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl text-sm font-medium transition">
              📧 Reach Out to Organizer
            </a>
          )}
        </div>
      )}

      {/* Improved Email Draft */}
      {showDraft && (
        <div className="border-t border-amber-200 bg-amber-50 p-6 mt-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 text-amber-800 font-semibold"><Mail size={20} /> Personalized Outreach Email</div>
            <Button variant="ghost" size="sm" onClick={() => setShowDraft(false)}><X size={18} /></Button>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-amber-200 text-sm whitespace-pre-wrap font-light text-gray-700 overflow-auto max-h-96">
            {draft}
          </div>
          <Button onClick={copyDraft} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700">
            <Copy size={18} className="mr-2" /> {copied ? '✅ Copied!' : 'Copy Draft'}
          </Button>
        </div>
      )}
    </div>
  );
}