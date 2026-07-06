'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function SubmitScholarship() {
  const [user, setUser] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    orgName: '', orgWebsite: '', orgEmail: '',
    title: '', amount: '', deadline: '', description: '',
    contactPerson: '', contactEmail: '',
  });
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push('/login');
      setUser(user);
    };
    checkUser();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

    setMessage('Submitting for review...');

    const { data: org } = await supabase
      .from('organizations')
      .upsert({
        name: formData.orgName.trim(),
        website: formData.orgWebsite.trim(),
        contact_email: formData.orgEmail.trim(),
        verified: false,
      })
      .select()
      .single();

    const { error } = await supabase.from('scholarship_submissions').insert({
      organization_id: org?.id,
      title: formData.title.trim(),
      amount: formData.amount ? parseFloat(formData.amount) : null,
      deadline: formData.deadline || null,
      eligibility: { location: "Philadelphia / Pittsburgh / PA area" },
      description: formData.description.trim(),
      contact_person: formData.contactPerson.trim(),
      contact_email: formData.contactEmail.trim(),
      submitted_by: user.id,
      status: 'pending',
    });

    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage('✅ Submission successful! It will be reviewed for legitimacy before going live.');
      setFormData({ orgName: '', orgWebsite: '', orgEmail: '', title: '', amount: '', deadline: '', description: '', contactPerson: '', contactEmail: '' });
      setStep(1);
    }
  };

  const resetForm = () => {
    setMessage('');
    setFormData({ orgName: '', orgWebsite: '', orgEmail: '', title: '', amount: '', deadline: '', description: '', contactPerson: '', contactEmail: '' });
    setStep(1);
  };

  if (!user) return <div className="p-8">Redirecting to login...</div>;

  return (
    <div className="min-h-screen bg-neutral py-12 px-4">
      <div className="max-w-2xl mx-auto card">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary">LocalLink Scholarships</h1>
          <p className="text-gray-600 mt-2">Submit real, local opportunities • Help students build relationships and win</p>
        </div>

        {message && (
          <div className={`p-4 rounded-2xl mb-8 text-center ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Step 1: Organization Info</h2>
              <input name="orgName" placeholder="Organization Name" value={formData.orgName} onChange={handleChange} required className="w-full p-4 border border-border rounded-xl" />
              <input name="orgWebsite" placeholder="Paste full https:// website" type="url" value={formData.orgWebsite} onChange={handleChange} required className="w-full p-4 border border-border rounded-xl" />
              <input name="orgEmail" placeholder="Official contact@org.com" type="email" value={formData.orgEmail} onChange={handleChange} required className="w-full p-4 border border-border rounded-xl" />
              <button type="button" onClick={() => setStep(2)} className="btn-primary w-full">Next →</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Step 2: Scholarship Details</h2>
              <input name="title" placeholder="Scholarship Title" value={formData.title} onChange={handleChange} required className="w-full p-4 border border-border rounded-xl" />
              <input name="amount" placeholder="Amount (USD)" type="number" value={formData.amount} onChange={handleChange} className="w-full p-4 border border-border rounded-xl" />
              <input name="deadline" placeholder="Deadline (YYYY-MM-DD)" type="date" value={formData.deadline} onChange={handleChange} className="w-full p-4 border border-border rounded-xl" />
              <textarea name="description" placeholder="Description / Eligibility" value={formData.description} onChange={handleChange} rows={4} className="w-full p-4 border border-border rounded-xl" />
              <input name="contactPerson" placeholder="Contact Person Name" value={formData.contactPerson} onChange={handleChange} required className="w-full p-4 border border-border rounded-xl" />
              <input name="contactEmail" placeholder="Contact Person Email" type="email" value={formData.contactEmail} onChange={handleChange} required className="w-full p-4 border border-border rounded-xl" />

              <div className="flex gap-4">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 border border-border rounded-xl">← Back</button>
                <button type="submit" className="flex-1 btn-primary">Submit for Review</button>
              </div>
            </div>
          )}
        </form>

        {message.includes('✅') && (
          <button onClick={resetForm} className="mt-6 w-full py-3 border border-accent text-accent rounded-xl hover:bg-accent hover:text-white transition">
            Submit Another Scholarship
          </button>
        )}
      </div>
    </div>
  );
}