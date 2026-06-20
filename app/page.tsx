'use client';

import { useState, useEffect } from 'react';
import { findScholarships, StudentProfile } from '@/lib/findScholarships';
import ScholarshipCard from '@/components/ScholarshipCard';

export default function Home() {

  const [formData, setFormData] = useState({
    school: '',
    hometown: '',
    hs_excellence: '',
    undergrad_excellence: '',
    military_status: 'No',
    first_gen: false,
    pell_eligible: false,
    other_characteristics: '',
  });

  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const findScholarshipsHandler = async () => {
    setLoading(true);
    setMatches([]);

    const excellenceAreas = [
      ...formData.hs_excellence.split(',').map(s => s.trim()).filter(Boolean),
      ...formData.undergrad_excellence.split(',').map(s => s.trim()).filter(Boolean),
      ...formData.other_characteristics.split(',').map(s => s.trim()).filter(Boolean),
    ];

    const profile: StudentProfile = {
      school: formData.school,
      hometown: formData.hometown,
      excellence_areas: excellenceAreas,
      military: formData.military_status !== 'No',
      first_gen: formData.first_gen,
      pell: formData.pell_eligible,
    };

    try {
      const results = await findScholarships(profile);
      setMatches(results.slice(0, 15));
    } catch (err: any) {
      console.error(err);
      alert(`Error finding scholarships: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 font-sans text-gray-900">
      <h1 className="text-4xl font-bold text-center mb-2">LocalLink Scholarships</h1>
      <p className="text-center text-lg text-gray-600 mb-8">
        Real local awards • Tiny applicant pools • A real person to reach out to today
      </p>

      <div className="flex justify-center mb-10">
        <a
          href="/saved"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium px-5 py-2 rounded-2xl hover:bg-blue-50 transition"
        >
          ❤️ View My Saved Scholarships
        </a>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow border space-y-6 text-gray-900">
        {/* Your existing beautiful form fields stay exactly the same */}
        <div>
          <label className="block text-sm font-medium mb-1">Where do you go to school?</label>
          <input name="school" value={formData.school} onChange={handleChange} className="w-full p-4 border rounded-2xl" placeholder="Temple University" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Where are you from (hometown / county)?</label>
          <input name="hometown" value={formData.hometown} onChange={handleChange} className="w-full p-4 border rounded-2xl" placeholder="Harrisburg, PA or Dauphin County" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">High school excellence (comma separated)</label>
          <textarea name="hs_excellence" value={formData.hs_excellence} onChange={handleChange} rows={2} className="w-full p-4 border rounded-2xl" placeholder="3.8 GPA, Varsity Soccer, Speech & Debate Superior" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Undergrad excellence (comma separated)</label>
          <textarea name="undergrad_excellence" value={formData.undergrad_excellence} onChange={handleChange} rows={2} className="w-full p-4 border rounded-2xl" placeholder="3.7 GPA" />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Military status</label>
            <select name="military_status" value={formData.military_status} onChange={handleChange} className="w-full p-4 border rounded-2xl">
              <option value="No">No</option>
              <option value="Veteran">Veteran</option>
              <option value="Dependent">Dependent of veteran</option>
              <option value="Active Duty">Active Duty / Reserves</option>
            </select>
          </div>
          <div className="pt-6 space-y-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="first_gen" checked={formData.first_gen} onChange={handleChange} />
              First-generation college student
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="pell_eligible" checked={formData.pell_eligible} onChange={handleChange} />
              Pell Grant eligible / low-income
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Other key characteristics (comma separated)</label>
          <textarea name="other_characteristics" value={formData.other_characteristics} onChange={handleChange} rows={2} className="w-full p-4 border rounded-2xl" placeholder="Woodworking hobby" />
        </div>

        <button
          onClick={findScholarshipsHandler}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-2xl text-lg transition"
        >
          {loading ? 'Finding your local scholarships…' : 'Find My Scholarships'}
        </button>
      </div>

      {matches.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">
            Your Local Matches ({matches.length}) – Reach Out & Build Real Relationships
          </h2>
          <div className="space-y-8">
            {matches.map((s: any) => (
              <ScholarshipCard
                key={s.id || s["Scholarship Name"]}
                scholarship={s}
                studentProfile={{
                  school: formData.school,
                  hometown: formData.hometown,
                  excellence_areas: [
                    ...formData.hs_excellence.split(',').map(t => t.trim()).filter(Boolean),
                    ...formData.undergrad_excellence.split(',').map(t => t.trim()).filter(Boolean),
                  ],
                  military: formData.military_status !== 'No',
                  first_gen: formData.first_gen,
                  pell: formData.pell_eligible,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}