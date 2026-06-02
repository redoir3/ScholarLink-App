'use client';

import { useState, useEffect } from 'react';
import ScholarshipCard from '@/components/ScholarshipCard';
import { Award, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient'; // keep your existing import

export default function SavedScholarships() {
  const [savedScholarships, setSavedScholarships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load full objects from localStorage (this is the reliable way)
    const saved = JSON.parse(localStorage.getItem('savedScholarships') || '[]');
    setSavedScholarships(saved);
    setLoading(false);
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-8 font-sans text-gray-900 min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="text-blue-600 hover:text-blue-700 flex items-center gap-2">
          <ArrowLeft size={20} /> Back to Find Scholarships
        </Link>
        <h1 className="text-4xl font-bold">❤️ My Saved Scholarships</h1>
      </div>

      <p className="text-gray-600 mb-10">
        These are the real, local, obtainable awards you’ve chosen. Reach out to the contact person, build a genuine relationship, and turn these into college funding.
      </p>

      {loading ? (
        <div className="text-center py-20">Loading your saved opportunities...</div>
      ) : savedScholarships.length > 0 ? (
        <div className="space-y-8">
          {savedScholarships.map((sch: any) => (
            <ScholarshipCard
              key={sch.id || sch["Scholarship Name"] || Math.random()}
              scholarship={sch}
              studentProfile={{
                school: sch.school || '', // fallback
                hometown: sch.hometown || '',
                excellence_areas: [],
                military: false,
                first_gen: false,
                pell: false,
              }}
            />
          ))}
        </div>
      ) : (
        <div className="mt-20 text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="mx-auto w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
            <Award className="w-10 h-10 text-amber-600" />
          </div>
          <h3 className="text-3xl font-semibold text-gray-900 mb-4">No saved scholarships yet</h3>
          <p className="max-w-md mx-auto text-gray-600 text-lg">
            Go discover scholarships that match your story. Save the ones where you can reach out to a real person and start a relationship.
          </p>
          <Link
            href="/"
            className="inline-block mt-8 px-8 py-4 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 transition"
          >
            Find Scholarships Now
          </Link>
        </div>
      )}
    </div>
  );
}