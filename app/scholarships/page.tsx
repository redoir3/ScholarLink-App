// app/scholarships/page.tsx
import { createClient } from '@/lib/supabase/client'; // ← CHANGE THIS LINE TO YOUR PROJECT'S CORRECT IMPORT

import ScholarshipCard from '@/components/ScholarshipCard';

export default async function ScholarshipsPage({ searchParams }: { searchParams: Promise<{ city?: string; state?: string; mode?: string }> }) {
  const resolvedSearchParams = await searchParams;
  
  const supabase = createClient();
  
  let query = supabase
    .from('scholarships')
    .select('*')
    .order('deadline', { ascending: true });

  const isLocalMode = resolvedSearchParams.mode === 'local' && resolvedSearchParams.city && resolvedSearchParams.state;

  if (isLocalMode) {
    query = query
      .ilike('city', `%${resolvedSearchParams.city}%`)
      .eq('state', resolvedSearchParams.state)
      .limit(20);
  } else {
    query = query.limit(12);
  }

  const { data: scholarships, error } = await query;

  if (error) {
    console.error('Supabase error:', error);
    return <div className="p-8 text-red-600">Error loading scholarships: {error.message}</div>;
  }

  return (
    <div className="container mx-auto py-12 px-6">
      {isLocalMode && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-3 rounded-xl mb-8">
          ✅ Showing local results for <strong>{resolvedSearchParams.city}, {resolvedSearchParams.state}</strong>. 
          Reach out to contacts to build relationships!
        </div>
      )}
      
      <h1 className="text-4xl font-bold mb-8">
        {isLocalMode 
          ? `Local Scholarships Near ${resolvedSearchParams.city}` 
          : 'Available Scholarships'}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {scholarships?.length > 0 ? (
          scholarships.map((scholarship: any) => (
            <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500 py-12">No matching scholarships found yet.</p>
        )}
      </div>
    </div>
  );
}