// app/local-search/page.tsx
import LocalSearch from '@/components/LocalSearch';

export default function LocalSearchPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Local Scholarship Finder</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select your city and state to discover real, local scholarships nearby. 
            Smaller applicant pools mean higher chances—and every opportunity includes a contact to reach out and build a genuine relationship.
          </p>
        </div>
        
        <LocalSearch />
        
        <div className="mt-12 text-center text-sm text-gray-500">
          Pro Tip: After finding matches, use our Email Draft tool to introduce yourself professionally to the listed contact person.
        </div>
      </div>
    </div>
  );
}