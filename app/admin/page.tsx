'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== 'your-email@example.com') { // Update with your email
        router.push('/login');
        return;
      }
      fetchSubmissions();
    };
    checkAuth();
  }, [router]);

  const fetchSubmissions = async () => {
    const { data, error } = await supabase
      .from('scholarship_submissions')
      .select(`*, organizations(*)`)
      .order('created_at', { ascending: false });

    if (error) setMessage('Error: ' + error.message);
    else setSubmissions(data || []);
    setLoading(false);
  };

  const handleApprove = async (id: string, orgId: string) => {
    await supabase.from('scholarship_submissions').update({ status: 'approved' }).eq('id', id);
    await supabase.from('organizations').update({ verified: true }).eq('id', orgId);
    setMessage('✅ Approved!');
    fetchSubmissions();
  };

  const handleReject = async (id: string) => {
    await supabase.from('scholarship_submissions').update({ status: 'rejected' }).eq('id', id);
    setMessage('Rejected.');
    fetchSubmissions();
  };

  if (loading) return <div className="p-8">Loading admin dashboard...</div>;

  return (
    <div className="min-h-screen bg-neutral p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-primary">Admin Moderation</h1>
          <button onClick={fetchSubmissions} className="btn-primary">Refresh</button>
        </div>

        {message && <div className="p-4 bg-green-100 rounded-2xl mb-6">{message}</div>}

        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">Scholarship</th>
                <th className="p-4 text-left">Organization</th>
                <th className="p-4 text-left">Contact</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub.id} className="border-t border-border">
                  <td className="p-4">
                    <strong>{sub.title}</strong><br />
                    ${sub.amount} • {sub.deadline}
                  </td>
                  <td className="p-4">
                    {sub.organizations?.name}<br />
                    <a href={sub.organizations?.website} target="_blank" className="text-blue-600 underline">Visit Site</a>
                  </td>
                  <td className="p-4">
                    {sub.contact_person}<br />
                    {sub.contact_email}
                  </td>
                  <td className="p-4 font-medium">{sub.status}</td>
                  <td className="p-4">
                    {sub.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(sub.id, sub.organization_id)} className="bg-green-600 text-white px-4 py-2 rounded-xl">Approve</button>
                        <button onClick={() => handleReject(sub.id)} className="bg-red-600 text-white px-4 py-2 rounded-xl">Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}