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

  // Improved Contact Handler
  const handleContact = () => {
    // Try multiple possible contact fields
    let contact = scholarship.contact_email || 
                  scholarship["Contact Name / Email / Phone / URL"] || 
                  scholarship.contact_url || '';

    if (!contact) {
      alert("No contact information available for this scholarship yet.\n\nWe're working hard to add direct contacts for every award!");
      return;
    }

    if (contact.includes('@')) {
      const subject = encodeURIComponent(`Inquiry about ${name}`);
      window.location.href = `mailto:${contact}?subject=${subject}`;
    } else if (contact.startsWith('http') || contact.startsWith('www')) {
      if (!contact.startsWith('http')) contact = 'https://' + contact;
      window.open(contact, '_blank');
    } else {
      alert(`Contact Info: ${contact}\n\nReach out warmly to build a real relationship — this is how students stand out!`);
    }
  };

  const generateEmailDraft = (): string => {
    if (!studentProfile?.school) {
      return "Please complete your profile above to generate a personalized outreach email.";
    }

    const contact = scholarship.contact_person || 'Scholarship Coordinator';
    const why = scholarship["Why Obtainable"] || 'this opportunity';
    const notes = scholarship["Notes (for Email Builder Personalization)"] || '';
    const excellence = studentProfile.excellence_areas?.length
      ? studentProfile.excellence_areas.join(', ')
      : 'your studies and character';

    const subject = `Excited to connect about the ${name} – ${studentProfile.hometown} student`;

    let body = `Hi ${contact},\n\n`;
    body += `My name is ${studentProfile.name || 'a dedicated student'}, and I’m a student at ${studentProfile.school} from ${studentProfile.hometown}. `;
    body += `I was truly inspired by the ${name} because ${why}. `;
    if (notes) body += `Your notes about ${notes} really stood out to me.\n\n`;
    body += `I excelled in ${excellence}. `;
    if (studentProfile.military) body += `With my military background, `;
    if (studentProfile.first_gen) body += `as a first-generation student, `;
    if (studentProfile.pell) body += `and as a Pell Grant recipient, `;
    body += `I’m deeply committed to making the most of opportunities like yours.\n\n`;
    body += `I’d love to build a genuine relationship with your team and learn how I can contribute. Would you be open to a quick chat?\n\n`;
    body += `Thank you for supporting students across America!\n\nWarmly,\n${studentProfile.name || 'Your Name'}`;

    return `Subject: ${subject}\n\n${body}`;
  };

  const draft = useMemo(() => generateEmailDraft(), [scholarship, studentProfile]);

  const copyDraft = async () => {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      <div className="p-6">
        {/* ... Your existing header, amount, why obtainable, tags ... */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">{name}</h3>
            <p className="text-gray-600 font-medium">{provider}</p>
          </div>
          <div className="flex items-center gap-2">
            {scholarship.amount && (
              <span className="text-3xl font-bold text-emerald-600">${scholarship.amount.toLocaleString()}</span>
            )}
            {scholarship.match_score && (
              <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1 rounded-2xl text-sm font-medium">
                <Award size={16} /> {scholarship.match_score}%
              </div>
            )}
          </div>
        </div>

        {scholarship["Why Obtainable"] && (
          <p className="text-gray-600 text-sm line-clamp-3 mb-4 italic">"{scholarship["Why Obtainable"]}"</p>
        )}

        {scholarship["Eligibility Tags"] && (
          <div className="flex flex-wrap gap-2 mb-6">
            {scholarship["Eligibility Tags"].split(',').map((tag: string, i: number) => (
              <span key={i} className="px-3 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-2xl">
                {tag.trim()}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={toggleSave} variant="outline" className="flex-1 flex items-center justify-center gap-2">
            <Heart className={isSaved ? 'fill-rose-500 text-rose-500' : ''} size={18} />
            {isSaved ? 'Saved ❤️' : 'Save for Later'}
          </Button>

          <Button
            onClick={() => setShowDraft(!showDraft)}
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white flex items-center justify-center gap-2"
            disabled={!studentProfile?.school}
          >
            <Mail size={18} />
            Generate Outreach Email
          </Button>

          <Button
            onClick={handleContact}
            className="flex-1 bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            Reach Out to Organizer
            <ExternalLink size={18} />
          </Button>
        </div>
      </div>

      {/* Email Draft Section - Unchanged */}
      {showDraft && (
        <div className="border-t border-amber-200 bg-amber-50 p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 text-amber-800 font-semibold">
              <Mail size={20} /> Your Personalized First Email
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowDraft(false)}>
              <X size={18} />
            </Button>
          </div>
          <p className="text-xs text-amber-700 mb-4">
            This warm draft pulls from your profile and the scholarship’s notes. 
            Copy it, make it your own, and start a real relationship!
          </p>
          <div className="bg-white rounded-2xl p-5 border border-amber-200 text-sm whitespace-pre-wrap font-light text-gray-700 overflow-auto max-h-96">
            {draft}
          </div>
          <Button onClick={copyDraft} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700">
            <Copy size={18} className="mr-2" />
            {copied ? '✅ Copied to clipboard!' : 'Copy Draft to Clipboard'}
          </Button>
        </div>
      )}
    </div>
  );
}